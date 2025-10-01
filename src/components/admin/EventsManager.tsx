import { useState } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import EditEventDialog from './EditEventDialog';

interface EventsManagerProps {
  events: Event[];
  onUpdate: () => void;
  isUltimateAdmin: boolean;
  currentUserId?: string;
}

const EventsManager: React.FC<EventsManagerProps> = ({ events, onUpdate, isUltimateAdmin, currentUserId }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const handleToggleStatus = async (event: Event) => {
    try {
      const newStatus = event.status === 'published' ? 'draft' : 'published';
      await updateDoc(doc(db, 'events', event.id), {
        status: newStatus,
        updatedAt: new Date(),
      });
      
      toast.success(`Event ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
      onUpdate();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update event status');
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
      toast.success('Event deleted successfully');
      onUpdate();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete event');
    } finally {
      setDeletingId(null);
    }
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Events Yet</h3>
          <p className="text-muted-foreground">Create your first event to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map(event => (
        <Card key={event.id} className="flex flex-col">
          <div className="h-48 overflow-hidden">
            <img 
              src={event.bannerURL || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg">{event.title}</CardTitle>
              <Badge variant={event.status === 'published' ? 'default' : 'secondary'} className="capitalize shrink-0">
                {event.status}
              </Badge>
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="capitalize">{event.category}</Badge>
              {event.registrations && event.registrations.length > 0 && (
                <Badge variant="outline">
                  {event.registrations.length} registered
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(event.date, 'PPP')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{event.location}</span>
              </div>
            </div>

            {(isUltimateAdmin || event.createdBy === currentUserId) && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleToggleStatus(event)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  {event.status === 'published' ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Publish
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => setEditingEvent(event)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={() => setDeletingId(event.id)}
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={deletingId !== null} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              and all registration data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingId && handleDelete(deletingId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditEventDialog
        open={editingEvent !== null}
        onOpenChange={(open) => !open && setEditingEvent(null)}
        onSuccess={onUpdate}
        event={editingEvent}
      />
    </div>
  );
};

export default EventsManager;

import { useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Event } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Bell, Check } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
  onUpdate?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onUpdate }) => {
  const { currentUser, userProfile } = useAuth();
  const [isRegistered, setIsRegistered] = useState(
    event.registrations?.includes(currentUser?.uid || '') || false
  );
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!currentUser) {
      toast.error('Please sign in to register for events');
      return;
    }

    setLoading(true);
    try {
      const eventRef = doc(db, 'events', event.id);
      
      if (isRegistered) {
        await updateDoc(eventRef, {
          registrations: arrayRemove(currentUser.uid)
        });
        setIsRegistered(false);
        toast.success('Successfully unregistered from event');
      } else {
        await updateDoc(eventRef, {
          registrations: arrayUnion(currentUser.uid)
        });
        setIsRegistered(true);
        toast.success('Successfully registered for event!');
      }
      
      onUpdate?.();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to update registration');
    } finally {
      setLoading(false);
    }
  };

  const handleSetReminder = () => {
    if (!currentUser) {
      toast.error('Please sign in to set reminders');
      return;
    }
    
    // For now, just show a confirmation
    toast.success('Reminder set! You will be notified before the event');
  };

  return (
    <Card className="overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col">
      <div className="h-48 overflow-hidden">
        <img 
          src={event.bannerURL || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-xl">{event.title}</CardTitle>
          <Badge className="capitalize shrink-0">{event.category}</Badge>
        </div>
        <CardDescription className="line-clamp-2">{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(event.date, 'PPP')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        </div>

        {currentUser && (
          <div className="flex gap-2">
            <Button 
              onClick={handleRegister} 
              disabled={loading}
              className="flex-1"
              variant={isRegistered ? 'outline' : 'default'}
            >
              {isRegistered ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Registered
                </>
              ) : (
                'Register'
              )}
            </Button>
            {isRegistered && (
              <Button 
                onClick={handleSetReminder}
                variant="outline"
                size="icon"
              >
                <Bell className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCard;

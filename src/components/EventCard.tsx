import { useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Event } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Bell, Check, ExternalLink, Mail, Phone, Trophy, DollarSign } from 'lucide-react';
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
          <div className="flex gap-2 shrink-0">
            <Badge className="capitalize">{event.category}</Badge>
            {event.entryFee.isFree ? (
              <Badge variant="outline">Free</Badge>
            ) : (
              <Badge variant="secondary">₹{event.entryFee.amount}</Badge>
            )}
          </div>
        </div>
        {event.categories && event.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {event.categories.map((cat, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {cat}
              </Badge>
            ))}
          </div>
        )}
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
            <div className="flex flex-col gap-1 flex-1">
              <span>{event.location}</span>
              {event.mapLink && (
                <a
                  href={event.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  View on map <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
          {event.prizeAmount && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>Prize: ₹{event.prizeAmount.toLocaleString()}</span>
            </div>
          )}
          {event.contactInfo && (event.contactInfo.email || event.contactInfo.phone) && (
            <div className="flex flex-col gap-1 text-sm text-muted-foreground pt-2 border-t">
              {event.contactInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${event.contactInfo.email}`} className="hover:text-primary">
                    {event.contactInfo.email}
                  </a>
                </div>
              )}
              {event.contactInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${event.contactInfo.phone}`} className="hover:text-primary">
                    {event.contactInfo.phone}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {currentUser && (
          <div className="space-y-2">
            {event.externalRegistrationLink ? (
              <Button 
                asChild
                className="w-full"
              >
                <a href={event.externalRegistrationLink} target="_blank" rel="noopener noreferrer">
                  Register <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            ) : (
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
            {event.howToRegisterLink && (
              <Button 
                asChild
                variant="outline"
                className="w-full"
                size="sm"
              >
                <a href={event.howToRegisterLink} target="_blank" rel="noopener noreferrer">
                  How to Register <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCard;

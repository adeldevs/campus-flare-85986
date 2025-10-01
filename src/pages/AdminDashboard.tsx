import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Event, AdminRequest } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Users, Shield } from 'lucide-react';
import EventsManager from '@/components/admin/EventsManager';
import AdminRequestsManager from '@/components/admin/AdminRequestsManager';
import CreateEventDialog from '@/components/admin/CreateEventDialog';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { userProfile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const isUltimateAdmin = userProfile?.role === 'ultimateAdmin';

  useEffect(() => {
    fetchData();
  }, [userProfile]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchEvents(), fetchAdminRequests()]);
    setLoading(false);
  };

  const fetchEvents = async () => {
    try {
      let eventsQuery;
      
      if (isUltimateAdmin) {
        eventsQuery = query(
          collection(db, 'events')
        );
      } else {
        eventsQuery = query(
          collection(db, 'events'),
          where('createdBy', '==', userProfile?.uid)
        );
      }
      
      const snapshot = await getDocs(eventsQuery);
      const eventsData = snapshot.docs.map(doc => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          date: data.date.toDate(),
          time: data.time,
          location: data.location,
          mapLink: data.mapLink,
          bannerURL: data.bannerURL,
          category: data.category,
          categories: data.categories,
          entryFee: data.entryFee || { isFree: true },
          prizeAmount: data.prizeAmount,
          contactInfo: data.contactInfo,
          externalRegistrationLink: data.externalRegistrationLink,
          mediaLinks: data.mediaLinks,
          howToRegisterLink: data.howToRegisterLink,
          createdBy: data.createdBy,
          createdByName: data.createdByName,
          status: data.status,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          registrations: data.registrations || [],
        } as Event;
      });
      
      // Sort by createdAt descending client-side
      eventsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Error loading events. Please refresh the page.');
    }
  };

  const fetchAdminRequests = async () => {
    if (!isUltimateAdmin) return;

    try {
      const requestsQuery = query(
        collection(db, 'adminRequests'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(requestsQuery);
      const requestsData = snapshot.docs.map(doc => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          userEmail: data.userEmail,
          reason: data.reason,
          status: data.status,
          createdAt: data.createdAt.toDate(),
          reviewedAt: data.reviewedAt?.toDate(),
          reviewedBy: data.reviewedBy,
        } as AdminRequest;
      });
      
      setAdminRequests(requestsData);
    } catch (error) {
      console.error('Error fetching admin requests:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {isUltimateAdmin ? 'Ultimate Admin' : 'Admin'} Dashboard
            </h1>
            <p className="text-muted-foreground">
              {isUltimateAdmin 
                ? 'Manage all events, admins, and system settings' 
                : 'Create and manage your events'}
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create Event
          </Button>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList>
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            {isUltimateAdmin && (
              <TabsTrigger value="admin-requests" className="gap-2">
                <Users className="h-4 w-4" />
                Admin Requests
                {adminRequests.filter(r => r.status === 'pending').length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {adminRequests.filter(r => r.status === 'pending').length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="events">
            <EventsManager 
              events={events} 
              onUpdate={fetchEvents}
              isUltimateAdmin={isUltimateAdmin}
              currentUserId={userProfile?.uid}
            />
          </TabsContent>

          {isUltimateAdmin && (
            <TabsContent value="admin-requests">
              <AdminRequestsManager 
                requests={adminRequests} 
                onUpdate={fetchAdminRequests}
              />
            </TabsContent>
          )}
        </Tabs>

        <CreateEventDialog 
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            fetchEvents();
            setShowCreateDialog(false);
          }}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;

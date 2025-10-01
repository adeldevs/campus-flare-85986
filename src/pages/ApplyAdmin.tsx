import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const ApplyAdmin = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);

  useEffect(() => {
    checkExistingRequest();
  }, [currentUser]);

  const checkExistingRequest = async () => {
    if (!currentUser) return;

    try {
      const requestsQuery = query(
        collection(db, 'adminRequests'),
        where('userId', '==', currentUser.uid)
      );
      
      const snapshot = await getDocs(requestsQuery);
      if (!snapshot.empty) {
        setExistingRequest({
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        });
      }
    } catch (error) {
      console.error('Error checking request:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile || !reason.trim()) {
      toast.error('Please provide a reason for your application');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'adminRequests'), {
        userId: currentUser.uid,
        userName: userProfile.displayName,
        userEmail: userProfile.email,
        reason: reason.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      
      toast.success('Application submitted successfully!');
      navigate('/');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (userProfile?.role === 'lowLevelAdmin' || userProfile?.role === 'ultimateAdmin') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-2">You're Already an Admin!</h2>
            <p className="text-muted-foreground mb-4">
              You have admin privileges and can manage events.
            </p>
            <Button onClick={() => navigate('/admin')}>
              Go to Admin Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (existingRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            {existingRequest.status === 'pending' && (
              <Clock className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            )}
            {existingRequest.status === 'approved' && (
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            )}
            {existingRequest.status === 'rejected' && (
              <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            )}
            <CardTitle className="text-2xl">Application Status</CardTitle>
            <CardDescription>
              Your admin application is currently{' '}
              <Badge className="capitalize">{existingRequest.status}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium">Your reason:</p>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                {existingRequest.reason}
              </p>
            </div>
            {existingRequest.status === 'pending' && (
              <p className="text-sm text-muted-foreground text-center">
                Please wait for the Ultimate Admin to review your application
              </p>
            )}
            {existingRequest.status === 'approved' && (
              <Button onClick={() => navigate('/admin')} className="w-full">
                Go to Admin Dashboard
              </Button>
            )}
            {existingRequest.status === 'rejected' && (
              <Button onClick={() => navigate('/')} className="w-full">
                Back to Home
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="h-16 w-16 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl">Apply for Admin Role</CardTitle>
            <CardDescription className="text-base">
              Fill out the form below to request admin privileges for creating and managing events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Why do you want to become an admin? *
                </Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain your reasons for wanting admin access and how you plan to contribute..."
                  rows={6}
                  required
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 50 characters required
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-sm">Admin Responsibilities:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Create and publish campus events</li>
                  <li>Update and manage your own events</li>
                  <li>Ensure event information is accurate</li>
                  <li>Respond to event-related queries</li>
                </ul>
              </div>

              <Button 
                type="submit" 
                disabled={loading || reason.length < 50}
                className="w-full h-12"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApplyAdmin;

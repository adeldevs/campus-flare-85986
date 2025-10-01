import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { AdminRequest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AdminRequestsManagerProps {
  requests: AdminRequest[];
  onUpdate: () => void;
}

const AdminRequestsManager: React.FC<AdminRequestsManagerProps> = ({ requests, onUpdate }) => {
  const { currentUser } = useAuth();

  const handleApprove = async (request: AdminRequest) => {
    try {
      // Update user role
      await updateDoc(doc(db, 'users', request.userId), {
        role: 'lowLevelAdmin',
        updatedAt: serverTimestamp(),
      });

      // Update request status
      await updateDoc(doc(db, 'adminRequests', request.id), {
        status: 'approved',
        reviewedAt: serverTimestamp(),
        reviewedBy: currentUser?.uid,
      });

      toast.success('Admin request approved!');
      onUpdate();
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (request: AdminRequest) => {
    try {
      await updateDoc(doc(db, 'adminRequests', request.id), {
        status: 'rejected',
        reviewedAt: serverTimestamp(),
        reviewedBy: currentUser?.uid,
      });

      toast.success('Admin request rejected');
      onUpdate();
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('Failed to reject request');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const reviewedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Pending Requests</h3>
          <div className="grid gap-4">
            {pendingRequests.map(request => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.userName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{request.userEmail}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Applied {format(request.createdAt, 'PPP')}
                      </p>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Reason for application:</p>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      {request.reason}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleApprove(request)}
                      className="flex-1"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button 
                      onClick={() => handleReject(request)}
                      variant="outline"
                      className="flex-1"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Reviewed Requests */}
      {reviewedRequests.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Reviewed Requests</h3>
          <div className="grid gap-4">
            {reviewedRequests.map(request => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.userName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{request.userEmail}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Reviewed {request.reviewedAt && format(request.reviewedAt, 'PPP')}
                      </p>
                    </div>
                    <Badge 
                      variant={request.status === 'approved' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {request.status}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Admin Requests</h3>
            <p className="text-muted-foreground">There are no admin requests to review</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminRequestsManager;

import React, { useState, useEffect } from 'react';
import { getAllRequests, updateRequestStatus, getAllUsers, getItems } from '../../lib/firestoreService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, Loader2, User, Package } from 'lucide-react';

export default function RequestManagement() {
  const [requests, setRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<Record<string, any>>({});
  const [items, setItems] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqs, allUsers, allItems] = await Promise.all([
        getAllRequests(),
        getAllUsers(),
        getItems()
      ]);

      const userMap = (allUsers || []).reduce((acc: any, u: any) => ({ ...acc, [u.id]: u }), {});
      const itemMap = (allItems || []).reduce((acc: any, i: any) => ({ ...acc, [i.id]: i }), {});
      
      setUsers(userMap);
      setItems(itemMap);
      setRequests(reqs || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: 'accepted' | 'rejected' | 'completed', itemId: string) => {
    try {
      await updateRequestStatus(requestId, status, itemId);
      toast.success(`Request ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'accepted': return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Rented</Badge>;
      case 'returning': return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Returning</Badge>;
      case 'completed': return <Badge variant="outline" className="bg-neutral-50 text-neutral-600 border-neutral-200"><CheckCircle className="w-3 h-3 mr-1" /> Returned</Badge>;
      case 'rejected': return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rental Requests</CardTitle>
        <CardDescription>Approve or reject student rental applications</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /></div>
        ) : requests.length === 0 ? (
          <div className="text-center p-8 text-neutral-500">No requests found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Total Rent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{users[req.borrowerId]?.name || 'Unknown User'}</span>
                      <span className="text-xs text-neutral-500">{users[req.borrowerId]?.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded bg-neutral-100 overflow-hidden flex-shrink-0">
                          <img src={items[req.itemId]?.imageUrl} className="w-full h-full object-cover" alt="" />
                       </div>
                       <span>{items[req.itemId]?.name || 'Unknown Item'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{req.duration} days</TableCell>
                  <TableCell className="font-bold">₹{req.totalPrice}</TableCell>
                  <TableCell>{getStatusBadge(req.status)}</TableCell>
                  <TableCell className="text-right">
                    {req.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                          onClick={() => handleStatusUpdate(req.id, 'accepted', req.itemId)}
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                          onClick={() => handleStatusUpdate(req.id, 'rejected', req.itemId)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    {req.status === 'returning' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                        onClick={() => handleStatusUpdate(req.id, 'completed', req.itemId)}
                      >
                        Confirm Receipt
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

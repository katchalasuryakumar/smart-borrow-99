import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserVerification } from '../../lib/firestoreService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, UserCheck, Loader2, Search, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function UserVerification() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers() as any[];
      // Filter only borrowers
      setUsers(data?.filter(u => u.role === 'borrower') || []);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (uid: string, status: boolean) => {
    try {
      await updateUserVerification(uid, status);
      toast.success(status ? 'Account Verified' : 'Verification Denied');
      fetchUsers();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Verifications</CardTitle>
        <CardDescription>Review student IDs and approve their access to the platform</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /></div>
        ) : users.length === 0 ? (
          <div className="text-center p-8 text-neutral-500">No student accounts found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>ID Proof</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span>{user.email}</span>
                      <span className="text-neutral-500">{user.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger render={<Button variant="outline" size="sm" className="h-8 gap-2" />}>
                        <Search className="w-3 h-3" /> View ID
                      </DialogTrigger>
                      <DialogContent className="max-w-xl">
                        <DialogHeader>
                          <DialogTitle>ID Proof - {user.name}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 border rounded-lg overflow-hidden bg-neutral-100 flex items-center justify-center min-h-[300px]">
                          <img src={user.idProofUrl} alt="ID Proof" className="max-w-full max-h-[500px] object-contain" />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell>
                    {user.isVerified ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><UserCheck className="w-3 h-3 mr-1" /> Approved</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-neutral-100 text-neutral-500">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!user.isVerified ? (
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                          onClick={() => handleVerify(user.id, true)}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                          onClick={() => handleVerify(user.id, false)}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-red-500 h-8" onClick={() => handleVerify(user.id, false)}>
                        Revoke
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

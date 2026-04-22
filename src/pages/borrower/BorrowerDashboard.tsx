import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { getItems, createRequest, getBorrowerRequests, getAdminSettings, returnItem } from '../../lib/firestoreService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { Package, Search, Info, CheckCircle, Clock, XCircle, ChevronRight, IndianRupee, Loader2, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BorrowerDashboard() {
  const { profile, user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [duration, setDuration] = useState(1);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [adminSettings, setAdminSettings] = useState<any>(null);

  useEffect(() => {
    if (profile?.isVerified && user?.uid) {
      fetchData();
    }
  }, [profile?.isVerified, user?.uid]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allItems, userReqs, settings] = await Promise.all([
        getItems(),
        getBorrowerRequests(user!.uid),
        getAdminSettings()
      ]);
      setItems(allItems || []);
      setRequests(userReqs || []);
      setAdminSettings(settings);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestInit = (item: any) => {
    setSelectedItem(item);
    setDuration(1);
  };

  const handleReturn = async (requestId: string) => {
    try {
      await returnItem(requestId);
      toast.success('Return request sent to admin!');
      fetchData();
    } catch (error) {
      toast.error('Failed to process return');
    }
  };

  const handlePaymentConfirm = async () => {
    try {
      const totalPrice = selectedItem.price * duration;
      await createRequest({
        borrowerId: user!.uid,
        itemId: selectedItem.id,
        duration: duration,
        totalPrice: totalPrice,
        status: 'pending'
      });
      toast.success('Rental request sent to admin!');
      setIsPaymentOpen(false);
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to send request');
    }
  };

  if (!profile?.isVerified) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
            <CardTitle>Account Pending Verification</CardTitle>
            <CardDescription>
              Your account is currently being reviewed by our campus admins. 
              Please check back soon!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="px-4 py-3 bg-neutral-50 rounded-lg text-sm text-neutral-600 border">
              We'll notify you once your student ID has been verified.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">Pending Approval</Badge>;
      case 'accepted': return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Currently Rented</Badge>;
      case 'returning': return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Return Pending</Badge>;
      case 'completed': return <Badge variant="outline" className="bg-neutral-50 text-neutral-600 border-neutral-200">Returned</Badge>;
      case 'rejected': return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Request Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-12">
      {/* Items Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold">Available for Rent</h2>
            <p className="text-neutral-500">Pick what you need, use it well, bring it back.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-all border-neutral-200 flex flex-col">
                <div className="aspect-[4/3] relative overflow-hidden bg-white">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 right-2">
                    <Badge className={item.status === 'available' ? 'bg-white/90 text-green-600 backdrop-blur-sm' : 'bg-white/90 text-red-600 backdrop-blur-sm'}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-4 flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <CardTitle className="text-lg font-bold">{item.name}</CardTitle>
                    <span className="text-primary font-bold">₹{item.price}<span className="text-[10px] text-neutral-400">/day</span></span>
                  </div>
                  <CardDescription className="text-xs line-clamp-2">{item.description}</CardDescription>
                </CardHeader>
                <CardFooter className="p-4 pt-0">
                  <Dialog>
                    <DialogTrigger render={<Button className="w-full" disabled={item.status !== 'available'} onClick={() => handleRequestInit(item)} />}>
                      Rent Now <ChevronRight className="w-4 h-4 ml-1" />
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Rent {item.name}</DialogTitle>
                      </DialogHeader>
                      <div className="py-6 space-y-6">
                        <div className="flex gap-4 p-3 bg-neutral-50 rounded-lg">
                           <img src={item.imageUrl} className="w-20 h-20 rounded object-cover shadow-sm" alt="" />
                           <div>
                              <p className="font-bold">{item.name}</p>
                              <p className="text-sm text-neutral-500">Rate: ₹{item.price}/day</p>
                              <p className="text-xs text-neutral-400">Category: {item.category}</p>
                           </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Rental Duration (Days)</Label>
                          <div className="flex items-center gap-4">
                             <Button variant="outline" size="icon" onClick={() => setDuration(Math.max(1, duration - 1))}>-</Button>
                             <div className="flex-1 text-center font-bold text-xl">{duration}</div>
                             <Button variant="outline" size="icon" onClick={() => setDuration(duration + 1)}>+</Button>
                          </div>
                        </div>

                        <div className="border-t pt-4 space-y-2">
                           <div className="flex justify-between text-sm">
                              <span>Subtotal</span>
                              <span>₹{item.price * duration}</span>
                           </div>
                           <div className="flex justify-between font-bold text-lg">
                              <span>Total to Pay</span>
                              <span>₹{item.price * duration}</span>
                           </div>
                        </div>
                      </div>
                      <DialogFooter>
                         <Button className="w-full" onClick={() => setIsPaymentOpen(true)}>Proceed to Payment</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Requests History */}
      <section className="space-y-6">
         <h2 className="text-2xl font-bold">Your Rental History</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map(req => (
              <Card key={req.id} className="bg-white border-neutral-100">
                <CardContent className="p-4 flex gap-4 items-center">
                  <div className="w-12 h-12 rounded bg-neutral-50 flex items-center justify-center">
                    <Package className="w-6 h-6 text-neutral-400" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <p className="font-bold">
                        {items.find(i => i.id === req.itemId)?.name || 'Fetching...'}
                      </p>
                      <span className="text-primary font-bold">₹{req.totalPrice}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mb-2">{req.duration} days rental</p>
                    <div className="flex justify-between items-center mt-3">
                      {getStatusBadge(req.status)}
                      {req.status === 'accepted' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          onClick={() => handleReturn(req.id)}
                        >
                          <RotateCcw className="w-3 h-3" /> Return Item
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {requests.length === 0 && !loading && (
              <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-neutral-50 text-neutral-400">
                 No rental requests yet. Start borrowing!
              </div>
            )}
         </div>
      </section>

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
         <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-6 text-center">
               <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 inline-block mx-auto">
                 <IndianRupee className="w-8 h-8 text-orange-600 mb-2 mx-auto" />
                 <p className="font-bold text-xl text-orange-900 font-mono">₹{selectedItem?.price * duration}</p>
                 <p className="text-[10px] text-orange-700 uppercase tracking-widest font-bold">Total Advance</p>
               </div>

               {adminSettings?.qrCodeUrl && (
                 <div className="space-y-2">
                   <p className="text-xs text-neutral-500">Scan to Pay</p>
                   <div className="p-2 border rounded-xl bg-white inline-block shadow-sm">
                      <img src={adminSettings.qrCodeUrl} className="w-48 h-48 object-contain" alt="Payment QR" />
                   </div>
                 </div>
               )}

               <div className="space-y-1">
                 <p className="text-xs text-neutral-500">UPI ID</p>
                 <p className="font-bold text-neutral-800 p-2 bg-neutral-100 rounded border border-neutral-200 select-all">{adminSettings?.upiId || 'Not Configured'}</p>
               </div>

               <div className="bg-blue-50 p-3 rounded-lg flex gap-3 text-left">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <p className="text-xs text-blue-700">Once paid, click the button below. Our admin will verify your payment and approve the request.</p>
               </div>
            </div>
            <DialogFooter>
               <Button className="w-full" onClick={handlePaymentConfirm}>I Have Paid ₹{selectedItem?.price * duration}</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}

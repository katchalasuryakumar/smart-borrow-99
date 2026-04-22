import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createUserProfile } from '../lib/firestoreService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { FileUp, Smartphone, Mail, Lock, User } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    idProofUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size too large. Max 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, idProofUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.idProofUrl) {
      toast.error('Please upload ID proof');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Auto-verify and set admin role for the project owner
      const isAdminEmail = formData.email.toLowerCase() === 'vinaykoushikkaki@gmail.com';
      
      await createUserProfile(userCredential.user.uid, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        idProofUrl: formData.idProofUrl,
        role: isAdminEmail ? 'admin' : 'borrower',
        isVerified: isAdminEmail // Admins are auto-verified
      });
      
      if (isAdminEmail) {
        toast.success('Admin account created and verified!');
      } else {
        toast.success('Registration successful! Waiting for admin approval.');
      }
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Borrower Registration</CardTitle>
          <CardDescription>Create your account and upload your student ID for verification</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="name" 
                  className="pl-10"
                  placeholder="John Doe" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    className="pl-10"
                    placeholder="john@example.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    type="tel" 
                    className="pl-10"
                    placeholder="+91 XXXXX XXXXX" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  className="pl-10"
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idProof">ID Proof (College ID / Aadhaar)</Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer relative overflow-hidden">
                <input 
                  type="file" 
                  id="idProof" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  required
                />
                {formData.idProofUrl ? (
                  <img src={formData.idProofUrl} alt="ID Preview" className="max-h-32 rounded object-contain" />
                ) : (
                  <>
                    <FileUp className="h-8 w-8 text-neutral-400 mb-2" />
                    <p className="text-sm text-neutral-500">Click or drag to upload (Max 2MB)</p>
                  </>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <div className="text-sm text-neutral-500">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Login here</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

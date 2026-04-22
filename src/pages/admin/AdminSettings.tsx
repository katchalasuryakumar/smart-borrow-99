import React, { useState, useEffect } from 'react';
import { getAdminSettings, updateAdminSettings } from '../../lib/firestoreService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { QrCode, Save, Loader2, ImagePlus } from 'lucide-react';

export default function AdminSettings() {
  const [formData, setFormData] = useState({
    upiId: '',
    qrCodeUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getAdminSettings();
      if (data) {
        setFormData({
          upiId: data.upiId || '',
          qrCodeUrl: data.qrCodeUrl || ''
        });
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, qrCodeUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAdminSettings(formData);
      toast.success('Settings updated');
    } catch (error) {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /></div>;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Payment Configuration</CardTitle>
        <CardDescription>Setup your UPI details for receiving rental advances</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="upiId">Your UPI ID</Label>
            <Input 
              id="upiId" 
              placeholder="example@upi" 
              value={formData.upiId}
              onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
              required 
            />
          </div>

          <div className="space-y-4">
            <Label>Payment QR Code</Label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 bg-neutral-50 min-h-[250px] relative overflow-hidden group">
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={handleFileChange}
              />
              {formData.qrCodeUrl ? (
                <div className="flex flex-col items-center">
                  <img src={formData.qrCodeUrl} alt="QR Code" className="max-h-48 object-contain mb-4" />
                  <p className="text-xs text-neutral-400">Click or drag to change QR Code</p>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <QrCode className="h-10 w-10 text-primary" />
                  </div>
                  <p className="font-medium text-neutral-600">Upload QR Code</p>
                  <p className="text-xs text-neutral-400 text-center max-w-[200px] mt-1">Students will use this QR to pay advance rent</p>
                </>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full h-11" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Changes
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save Configuration
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

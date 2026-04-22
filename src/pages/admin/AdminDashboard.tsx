import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Package, ClipboardList, Users, Settings as SettingsIcon } from 'lucide-react';
import ItemManagement from './ItemManagement';
import RequestManagement from './RequestManagement';
import UserVerification from './UserVerification';
import AdminSettings from './AdminSettings';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
        <p className="text-neutral-500">Manage your inventory, rental requests, and student verifications.</p>
      </div>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList className="bg-white border p-1 h-12">
          <TabsTrigger value="items" className="gap-2 px-6">
            <Package className="w-4 h-4" />
            Items
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2 px-6">
            <ClipboardList className="w-4 h-4" />
            Requests
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2 px-6">
            <Users className="w-4 h-4" />
            Verifications
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2 px-6">
            <SettingsIcon className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <ItemManagement />
        </TabsContent>
        <TabsContent value="requests">
          <RequestManagement />
        </TabsContent>
        <TabsContent value="users">
          <UserVerification />
        </TabsContent>
        <TabsContent value="settings">
          <AdminSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

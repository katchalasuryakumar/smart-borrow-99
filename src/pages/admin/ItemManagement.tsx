import React, { useState, useEffect } from 'react';
import { getItems, addItem, updateItem, deleteItem } from '../../lib/firestoreService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, ImagePlus, Loader2, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ItemManagement() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getItems();
      setItems(data || []);
    } catch (error) {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      };

      if (editingItem) {
        await updateItem(editingItem.id, data);
        toast.success('Item updated');
      } else {
        await addItem(data);
        toast.success('Item added');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchItems();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', quantity: '', category: '', imageUrl: '' });
    setEditingItem(null);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      quantity: item.quantity.toString(),
      category: item.category,
      imageUrl: item.imageUrl
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(id);
        toast.success('Item deleted');
        fetchItems();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Inventory</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger render={<Button className="gap-2" />}>
            <Plus className="w-4 h-4" /> Add New Item
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price per day (₹)</Label>
                  <Input 
                    id="price" 
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input 
                    id="quantity" 
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input 
                  id="category" 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Item Image</Label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 bg-neutral-50 h-32 relative overflow-hidden">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-contain" />
                  ) : (
                    <>
                      <ImagePlus className="h-8 w-8 text-neutral-400 mb-2" />
                      <p className="text-xs text-neutral-500 text-center">Click to upload image</p>
                    </>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">
                  {editingItem ? 'Update Item' : 'Save Item'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /></div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center gap-2">
          <Package className="w-12 h-12 text-neutral-200" />
          <p className="text-neutral-500">No items in inventory yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden flex flex-col">
              <div className="aspect-video bg-neutral-100 flex items-center justify-center overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : <Package className="w-8 h-8 text-neutral-300" />}
              </div>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-2 text-[10px] uppercase font-bold">{item.category}</Badge>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </div>
                  <Badge className={item.status === 'available' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-red-100 text-red-700 hover:bg-red-100'}>
                    {item.status}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2 text-xs">{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 flex-grow">
                <div className="flex justify-between text-sm">
                  <span>Price: <span className="font-bold">₹{item.price}/day</span></span>
                  <span>Qty: <span className="font-bold">{item.quantity}</span></span>
                </div>
              </CardContent>
              <CardFooter className="p-4 border-t bg-neutral-50 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(item)}>
                  <Pencil className="w-3 h-3 mr-2" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

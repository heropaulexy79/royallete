'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { FoodItem } from '@/types/schema';
import { Plus, Trash2, Edit2, Check, X, Utensils, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MenuManagement() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'Burgers',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800',
    is_available: true
  });

  useEffect(() => {
    const q = query(collection(db, 'foodItems'));
    const unsub = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FoodItem)));
    });
    return () => unsub();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'foodItems'), {
      ...newItem,
      price: Number(newItem.price),
      restaurant_id: 'r1'
    });
    setIsAdding(false);
    setNewItem({
      name: '',
      price: '',
      category: 'Burgers',
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800',
      is_available: true
    });
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'foodItems', id), { is_available: !current });
  };

  const deleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteDoc(doc(db, 'foodItems', id));
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-brand-dark mb-1">Menu Management</h1>
            <p className="text-slate-500">Add, edit, or remove dishes from your digital menu.</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} /> Add New Item
          </button>
        </div>

        {/* Add Item Form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <form onSubmit={handleAddItem} className="bg-white rounded-3xl p-8 border-2 border-brand-primary/20 shadow-xl shadow-brand-primary/5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Item Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Cheese Burger"
                      className="input"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Price (₦)</label>
                    <input 
                      required
                      type="number" 
                      placeholder="4000"
                      className="input"
                      value={newItem.price}
                      onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Category</label>
                    <select 
                      className="input appearance-none"
                      value={newItem.category}
                      onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    >
                      <option>Burgers</option>
                      <option>Pizza</option>
                      <option>Salads</option>
                      <option>Pasta</option>
                      <option>Sides</option>
                      <option>Desserts</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Image URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="url" 
                        className="input pl-12"
                        value={newItem.image_url}
                        onChange={(e) => setNewItem({...newItem, image_url: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 font-bold text-slate-400">Cancel</button>
                  <button type="submit" className="btn-primary">Save Product</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu Items List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.id} className="card group">
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-brand-dark truncate">{item.name}</h3>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-slate-400 hover:text-blue-500"><Edit2 size={16} /></button>
                      <button onClick={() => deleteItem(item.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <p className="text-brand-primary font-black text-lg">₦{item.price.toLocaleString()}</p>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${item.is_available ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                   <span className={`text-xs font-bold ${item.is_available ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {item.is_available ? 'Available' : 'Sold Out'}
                   </span>
                </div>
                <button 
                  onClick={() => toggleAvailability(item.id, item.is_available)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    item.is_available ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  {item.is_available ? 'Mark Sold Out' : 'Mark Available'}
                </button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="col-span-full py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center text-center">
              <Utensils size={48} className="text-slate-200 mb-4" />
              <p className="text-slate-400 font-medium">No menu items found. Start by adding a new dish!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

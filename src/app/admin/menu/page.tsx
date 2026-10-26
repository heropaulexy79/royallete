'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { FoodItem } from '@/types/schema';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Utensils, 
  Image as ImageIcon, 
  Check, 
  X, 
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_PRESETS = [
  'Rice Dishes',
  'Grills & Chicken',
  'Burgers & Fast Food',
  'Pastas & Noodles',
  'Drinks & Smoothies',
  'Sides & Finger Foods',
  'Traditional Soups',
  'Desserts'
];

const SAMPLE_IMAGES = [
  { label: 'Jollof / Rice', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800' },
  { label: 'Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800' },
  { label: 'Grilled Chicken', url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=800' },
  { label: 'Smoothie / Drink', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800' },
  { label: 'Pasta', url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281084?q=80&w=800' },
];

export default function MenuManagement() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Rice Dishes',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800',
    is_available: true
  });

  // Listen to menu items from Firestore
  useEffect(() => {
    const q = query(collection(db, 'foodItems'));
    const unsub = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FoodItem)));
      setLoading(false);
    }, (error) => {
      console.warn("Firestore snapshot listener error in admin menu:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      price: '',
      category: 'Rice Dishes',
      description: '',
      image_url: SAMPLE_IMAGES[0].url,
      is_available: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category || 'Rice Dishes',
      description: item.description || '',
      image_url: item.image_url || SAMPLE_IMAGES[0].url,
      is_available: item.is_available ?? true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      alert('Please fill in product name and price.');
      return;
    }

    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid price.');
      return;
    }

    try {
      if (editingItem) {
        // Update existing item
        await updateDoc(doc(db, 'foodItems', editingItem.id), {
          name: formData.name.trim(),
          price: priceNum,
          category: formData.category,
          description: formData.description.trim(),
          image_url: formData.image_url.trim(),
          is_available: formData.is_available,
        });
      } else {
        // Add new item
        await addDoc(collection(db, 'foodItems'), {
          name: formData.name.trim(),
          price: priceNum,
          category: formData.category,
          description: formData.description.trim(),
          image_url: formData.image_url.trim(),
          is_available: formData.is_available,
          created_at: new Date()
        });
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving food product: ', error);
      alert('Failed to save food product. Check Firebase configuration.');
    }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'foodItems', id), { is_available: !current });
  };

  const deleteItem = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from the menu?`)) {
      await deleteDoc(doc(db, 'foodItems', id));
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category || 'General')))];

  return (
    <main className="min-h-screen bg-slate-50 pb-24 sm:pb-0">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-5 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles size={13} /> Restaurant Catalog
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-brand-dark">Menu & Food Products</h1>
            <p className="text-slate-500 text-sm sm:text-base">
              Add new dishes, set prices, and manage availability.
            </p>
          </div>
          <button 
            onClick={openAddModal}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-amber-500/20 py-2.5 px-5 rounded-xl h-fit self-start text-sm"
          >
            <Plus size={18} /> Add Food Product
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 flex flex-col gap-3 mb-5 sm:mb-8">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedCategory === cat 
                    ? 'bg-brand-dark text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Modal: Add / Edit Product */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl border border-slate-100 overflow-y-auto max-h-[92vh]"
              >
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                  <h2 className="text-lg sm:text-2xl font-black text-brand-dark flex items-center gap-2">
                    <Utensils className="text-brand-primary" size={24} />
                    {editingItem ? 'Edit Food Product' : 'Add New Food Product'}
                  </h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-bold text-slate-700">Product Name *</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Royallete Special Jollof Rice"
                        className="input"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Price (₦) *</label>
                      <input 
                        required
                        type="number" 
                        placeholder="3500"
                        className="input"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Category</label>
                      <input 
                        type="text"
                        list="category-suggestions"
                        placeholder="Select or type category..."
                        className="input"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                      <datalist id="category-suggestions">
                        {CATEGORY_PRESETS.map(cat => <option key={cat} value={cat} />)}
                      </datalist>
                    </div>

                    {/* Description */}
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-bold text-slate-700">Description (Optional)</label>
                      <textarea 
                        placeholder="Briefly describe the ingredients, side inclusions, or portion size..."
                        className="input h-20 resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    {/* Image URL */}
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-bold text-slate-700 flex justify-between items-center">
                        <span>Image URL</span>
                        <span className="text-xs text-slate-400 font-normal">Choose preset below or paste URL</span>
                      </label>
                      <div className="relative">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="url" 
                          placeholder="https://..."
                          className="input pl-12"
                          value={formData.image_url}
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        />
                      </div>

                      {/* Quick sample image picker */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {SAMPLE_IMAGES.map((img) => (
                          <button
                            key={img.label}
                            type="button"
                            onClick={() => setFormData({ ...formData, image_url: img.url })}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                              formData.image_url === img.url
                                ? 'bg-brand-primary text-white border-brand-primary'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {img.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Availability */}
                    <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-700 text-sm">Product Availability</p>
                        <p className="text-xs text-slate-400">Available products can be immediately added to customer carts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.is_available} 
                          onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)} 
                      className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary px-8 py-3 rounded-xl"
                    >
                      {editingItem ? 'Save Changes' : 'Create Product'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="card group hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-3 mb-3">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                      <img 
                        src={item.image_url || SAMPLE_IMAGES[0].url} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                      {!item.is_available && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-wider">
                          Sold Out
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                          {item.category || 'General'}
                        </span>
                        <div className="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(item)}
                            title="Edit Product"
                            className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => deleteItem(item.id, item.name)}
                            title="Delete Product"
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-bold text-brand-dark text-sm sm:text-base mt-1 line-clamp-1">{item.name}</h3>
                      <p className="text-brand-primary font-black text-base sm:text-lg mt-0.5">₦{item.price.toLocaleString()}</p>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.is_available ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    <span className={`text-xs font-bold ${item.is_available ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {item.is_available ? 'Active in Menu' : 'Unavailable / Sold Out'}
                    </span>
                  </div>
                  <button 
                    onClick={() => toggleAvailability(item.id, item.is_available)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      item.is_available 
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    {item.is_available ? 'Mark Sold Out' : 'Mark Available'}
                  </button>
                </div>
              </div>
            ))}

            {filteredItems.length === 0 && (
              <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center text-center p-8">
                <Utensils size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-brand-dark mb-1">No products found</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-sm">
                  {searchQuery ? 'No menu items match your search term.' : 'Your restaurant menu is currently empty.'}
                </p>
                <button onClick={openAddModal} className="btn-primary py-2.5 px-6 text-sm">
                  <Plus size={16} className="inline mr-1" /> Add Your First Product
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

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
import { FoodItem, ProductCategory } from '@/types/schema';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Utensils, 
  X, 
  Sparkles, 
  Search, 
  AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_PRESETS: ProductCategory[] = [
  'Shawarma',
  'Pizza',
  'Burger',
  'Chicken & Chips',
  'Food',
  'Drinks',
  'Ice Cream',
  'Snacks'
];

const SAMPLE_PRESET_IMAGES = [
  { label: 'Shawarma', url: 'https://images.unsplash.com/photo-1642962002196-80415d487f3b?q=80&w=800' },
  { label: 'Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800' },
  { label: 'Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800' },
  { label: 'Chicken & Chips', url: 'https://images.unsplash.com/photo-1518013034477-2990fa317e23?q=80&w=800' },
  { label: 'Food / Rice', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800' },
  { label: 'Drink / Can', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800' },
  { label: 'Ice Cream', url: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=800' },
  { label: 'Snack / Pastry', url: 'https://images.unsplash.com/photo-1621200414838-84423c723707?q=80&w=800' },
];

export default function MenuManagement() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Shawarma' as ProductCategory,
    description: '',
    image_url: SAMPLE_PRESET_IMAGES[0].url,
    is_available: true,
    is_featured: false,
  });

  // Listen to menu items from Firestore
  useEffect(() => {
    const q = query(collection(db, 'foodItems'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as FoodItem))
        .filter(item => !(item as { is_legacy?: boolean }).is_legacy); // Filter out archived legacy items
      setItems(docs);
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
      category: 'Shawarma',
      description: '',
      image_url: SAMPLE_PRESET_IMAGES[0].url,
      is_available: true,
      is_featured: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: (item.category as ProductCategory) || 'Shawarma',
      description: item.description || '',
      image_url: item.image_url || SAMPLE_PRESET_IMAGES[0].url,
      is_available: item.is_available ?? true,
      is_featured: item.is_featured ?? false,
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
      alert('Please enter a valid numeric price.');
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
          is_featured: formData.is_featured,
          updated_at: new Date().toISOString(),
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
          is_featured: formData.is_featured,
          restaurant_id: 'deskilz',
          created_at: new Date().toISOString(),
        });
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving food product: ', error);
      alert('Failed to save food product. Check Firebase connection.');
    }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'foodItems', id), { is_available: !current });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    try {
      await deleteDoc(doc(db, 'foodItems', deleteConfirmation.id));
      setDeleteConfirmation(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete item.');
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...CATEGORY_PRESETS];

  return (
    <main className="min-h-screen bg-[#faf6f0] pb-28 sm:pb-12 flex flex-col">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10 w-full flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-red-50 text-brand-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={13} /> Déskilz Catalogue Manager
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-brand-dark">Menu & Food Products</h1>
            <p className="text-[#7a6655] text-sm sm:text-base mt-0.5">
              Live management for all {items.length} dishes in the approved catalogue.
            </p>
          </div>
          <button 
            onClick={openAddModal}
            className="btn-primary flex items-center gap-2 py-3 px-6 rounded-xl text-sm font-extrabold cursor-pointer"
          >
            <Plus size={18} /> Add Dish
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#ede5da] flex flex-col gap-3 mb-6 sm:mb-8">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a89080]" size={17} />
            <input 
              type="text" 
              placeholder="Search dishes by name or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#fdf8f3] border border-[#ede5da] rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedCategory === cat 
                    ? 'bg-brand-primary text-white shadow-sm' 
                    : 'bg-[#ede5da] text-[#7a6655] hover:bg-[#e0d5c5]'
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#ede5da] overflow-y-auto max-h-[92vh]"
              >
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#ede5da]">
                  <h2 className="text-xl sm:text-2xl font-black text-brand-dark flex items-center gap-2">
                    <Utensils className="text-brand-primary" size={22} />
                    {editingItem ? 'Edit Dish' : 'Add New Dish'}
                  </h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-xl text-[#a89080] hover:text-brand-dark hover:bg-[#fdf8f3]"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-brand-dark">Dish Name *</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Double Chicken Suya Special"
                        className="input"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    {/* Price */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-brand-dark">Price in NGN (₦) *</label>
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
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-brand-dark">Category *</label>
                      <select 
                        className="input"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                      >
                        {CATEGORY_PRESETS.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-brand-dark">Description (Optional)</label>
                      <textarea 
                        placeholder="Portion size, ingredients, spices, or accompaniment notes..."
                        className="input h-20 resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    {/* Image URL with live preview */}
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-bold text-brand-dark flex justify-between items-center">
                        <span>Image URL</span>
                        <span className="text-[11px] text-[#a89080] font-normal">Choose preset below or paste URL</span>
                      </label>
                      <div className="flex gap-3 items-center">
                        <div className="w-14 h-14 rounded-xl bg-[#ede5da] overflow-hidden border border-[#d4c9b8] flex-shrink-0">
                          <img 
                            src={formData.image_url || SAMPLE_PRESET_IMAGES[0].url} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <input 
                          type="url" 
                          placeholder="https://images.unsplash.com/..."
                          className="input flex-1"
                          value={formData.image_url}
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        />
                      </div>

                      {/* Quick presets */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {SAMPLE_PRESET_IMAGES.map((img) => (
                          <button
                            key={img.label}
                            type="button"
                            onClick={() => setFormData({ ...formData, image_url: img.url })}
                            className={`text-[11px] px-2 py-1 rounded-lg border transition-all ${
                              formData.image_url === img.url
                                ? 'bg-brand-primary text-white border-brand-primary font-bold'
                                : 'bg-[#fdf8f3] border-[#ede5da] text-[#7a6655] hover:bg-[#f0e8dc]'
                            }`}
                          >
                            {img.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Availability & Featured toggles */}
                    <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fdf8f3] border border-[#ede5da]">
                        <div>
                          <p className="font-bold text-brand-dark text-xs">Available for Orders</p>
                          <p className="text-[10px] text-[#a89080]">Can be ordered by customers</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.is_available} 
                            onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-[#d4c9b8] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fdf8f3] border border-[#ede5da]">
                        <div>
                          <p className="font-bold text-brand-dark text-xs">Homepage Featured</p>
                          <p className="text-[10px] text-[#a89080]">Highlight on homepage</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.is_featured} 
                            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-[#d4c9b8] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#facc15]"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-[#ede5da]">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)} 
                      className="px-5 py-2.5 font-bold text-[#7a6655] hover:bg-[#fdf8f3] rounded-xl text-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary px-7 py-2.5 rounded-xl text-sm font-extrabold cursor-pointer"
                    >
                      {editingItem ? 'Save Changes' : 'Create Dish'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirmation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl"
              >
                <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <AlertTriangle size={28} />
                </div>
                <h3 className="text-lg font-black text-brand-dark">Confirm Dish Deletion</h3>
                <p className="text-[#7a6655] text-xs sm:text-sm">
                  Are you sure you want to remove <strong>{deleteConfirmation.name}</strong> from the Déskilz catalogue?
                </p>
                <div className="flex gap-3 justify-center pt-2">
                  <button
                    onClick={() => setDeleteConfirmation(null)}
                    className="px-5 py-2.5 rounded-xl font-bold text-[#7a6655] hover:bg-[#fdf8f3] text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-6 py-2.5 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white text-sm shadow-md"
                  >
                    Yes, Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="py-24 flex flex-col justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-primary border-t-transparent mb-3" />
            <p className="text-[#a89080] text-xs font-bold">Loading dishes from Firestore...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="card flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex gap-3.5 mb-3">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#ede5da] flex-shrink-0 relative">
                      <img 
                        src={item.image_url || SAMPLE_PRESET_IMAGES[0].url} 
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
                        <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded">
                          {item.category || 'General'}
                        </span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => openEditModal(item)}
                            title="Edit Dish"
                            className="p-1.5 text-[#a89080] hover:text-brand-primary hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmation({ id: item.id, name: item.name })}
                            title="Delete Dish"
                            className="p-1.5 text-[#a89080] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-extrabold text-brand-dark text-sm sm:text-base mt-1 line-clamp-1">{item.name}</h3>
                      <p className="text-brand-primary font-black text-base mt-0.5">₦{item.price.toLocaleString()}</p>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-[#7a6655] line-clamp-2 mb-3 bg-[#fdf8f3] p-2.5 rounded-xl border border-[#ede5da]">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#ede5da] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.is_available ? 'bg-emerald-500 animate-pulse' : 'bg-[#c4b8a8]'}`} />
                    <span className={`text-xs font-bold ${item.is_available ? 'text-emerald-600' : 'text-[#a89080]'}`}>
                      {item.is_available ? 'Active in Menu' : 'Sold Out'}
                    </span>
                  </div>
                  <button 
                    onClick={() => toggleAvailability(item.id, item.is_available)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      item.is_available 
                        ? 'bg-[#ede5da] text-[#7a6655] hover:bg-[#e0d5c5]' 
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    {item.is_available ? 'Mark Sold Out' : 'Mark Active'}
                  </button>
                </div>
              </div>
            ))}

            {filteredItems.length === 0 && (
              <div className="col-span-full py-16 bg-white rounded-3xl border border-dashed border-[#ede5da] flex flex-col items-center text-center p-8">
                <Utensils size={44} className="text-[#c4b8a8] mb-3" />
                <h3 className="text-base font-bold text-brand-dark mb-1">No dishes found</h3>
                <p className="text-[#a89080] text-xs mb-5 max-w-sm">
                  {searchQuery ? 'No dishes match your search.' : 'No items found in this category.'}
                </p>
                <button onClick={openAddModal} className="btn-primary py-2 px-5 text-xs font-bold">
                  <Plus size={15} className="inline mr-1" /> Add New Dish
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

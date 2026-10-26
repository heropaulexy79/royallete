const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } = require("firebase/firestore");
const path = require("path");

// Load .env.local environment variables
require("dotenv").config({ path: path.resolve(__dirname, "../../.env.local") });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const FOOD_ITEMS = [
  // RICE DISHES
  { name: 'Rice + Peppered Chicken', price: 3500, category: 'Rice', image_url: 'https://images.unsplash.com/photo-1512058560566-d8d437a17364?q=80&w=800', is_available: true, restaurant_id: 'r1' },
  { name: 'Rice + Turkey', price: 4500, category: 'Rice', image_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=800', is_available: true, restaurant_id: 'r1' },
  { name: 'Rice + Medium Barbecued Chicken', price: 4000, category: 'Rice', image_url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=800', is_available: true, restaurant_id: 'r1' },
  { name: 'Rice + Large Barbecued Chicken', price: 5500, category: 'Rice', image_url: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?q=80&w=800', is_available: true, restaurant_id: 'r1' },
  
  // PASTA DISHES
  { name: 'Pasta + Peppered Chicken', price: 3500, category: 'Pasta', image_url: 'https://images.unsplash.com/photo-1546548970-71785318a17b?q=80&w=800', is_available: true, restaurant_id: 'r1' },
  { name: 'Pasta + Turkey', price: 4500, category: 'Pasta', image_url: 'https://images.unsplash.com/photo-1558985226-990c000ad04f?q=80&w=800', is_available: true, restaurant_id: 'r1' },
  { name: 'Pasta + Medium Barbecued Chicken', price: 4000, category: 'Pasta', image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800', is_available: true, restaurant_id: 'r1' },
  { name: 'Pasta + Large Barbecued Chicken', price: 5500, category: 'Pasta', image_url: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=800', is_available: true, restaurant_id: 'r1' },
  
  // CHIPS DISHES
  { name: 'Chips + Chicken (Medium Barbecued)', price: 4000, category: 'Chips', image_url: 'https://images.unsplash.com/photo-1518013034477-2990fa317e23?q=80&w=800', is_available: true, restaurant_id: 'r1' },
  { name: 'Chips + Chicken (Large Barbecued)', price: 5500, category: 'Chips', image_url: 'https://images.unsplash.com/photo-1621200414838-84423c723707?q=80&w=800', is_available: true, restaurant_id: 'r1' },
  
  // OTHERS
  { name: 'Single Pringle', price: 1500, category: 'Others', image_url: 'https://images.unsplash.com/photo-1566478989125-edfc9622d7ba?q=80&w=800', is_available: true, restaurant_id: 'r1' },
  { name: 'Double Sausage', price: 1000, category: 'Others', image_url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=800', is_available: true, restaurant_id: 'r1' },
  { name: 'Shawarma', price: 2500, category: 'Others', image_url: 'https://images.unsplash.com/photo-1642962002196-80415d487f3b?q=80&w=800', is_available: true, restaurant_id: 'r1' },
  
  // DRINKS
  { name: 'Smoothie', price: 2500, category: 'Drinks', image_url: 'https://images.unsplash.com/photo-1502741224143-90386d7cd8c9?q=80&w=800', is_available: true, restaurant_id: 'r1' },
  { name: 'Parfait', price: 3500, category: 'Drinks', image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=800', is_available: true, restaurant_id: 'r1' },
  { name: 'Soft Drink', price: 500, category: 'Drinks', image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800', is_available: true, restaurant_id: 'r1' },
];

async function seed() {
  if (!firebaseConfig.projectId) {
    console.error("❌ Error: Firebase configuration missing in environment variables.");
    return;
  }

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // Clear existing food items first to avoid duplicates
  console.log("🧹 Clearing old menu items...");
  const snapshot = await getDocs(collection(db, "foodItems"));
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
  }

  console.log("🚀 Seeding New Menu Items...");
  for (const item of FOOD_ITEMS) {
    await addDoc(collection(db, "foodItems"), item);
    console.log(`✅ Added: ${item.name}`);
  }

  console.log("⭐ Seeding Complete!");
}

seed().catch(console.error);

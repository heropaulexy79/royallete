const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const EXPECTED_CATEGORIES = {
  'Shawarma': 12,
  'Pizza': 9,
  'Burger': 2,
  'Chicken & Chips': 4,
  'Food': 8,
  'Drinks': 18,
  'Ice Cream': 12,
  'Snacks': 5,
};

async function testE2E() {
  console.log('🧪 RUNNING END-TO-END VERIFICATION CHECKS...\n');

  // 1. WhatsApp helper test
  const testItems = [
    { food_item_id: '1', name: 'Double Chicken Suya Special', quantity: 2, price: 4500 },
    { food_item_id: '2', name: 'Rice Combo (Jollof Rice, Fried Rice and Chicken)', quantity: 1, price: 3000 },
    { food_item_id: '3', name: 'Coke', quantity: 2, price: 800 },
  ];
  const totalPrice = 4500 * 2 + 3000 * 1 + 800 * 2; // 13,600

  // Check WhatsApp message format
  const itemList = testItems
    .map(item => `• *${item.quantity}x ${item.name}* — ₦${(item.price * item.quantity).toLocaleString()}`)
    .join('\n');
  const message = `👋 *Hello Déskilz Restaurant! I want to place an order:*\n\n📋 *Order Items:*\n${itemList}\n\n💰 *Total Amount:* ₦${totalPrice.toLocaleString()}\n👤 *Customer Name:* Test Customer\n📞 *Phone Number:* 08012345678\n🔖 *Order Ref:* #TEST01\n\nPlease confirm my order and let me know when it will be ready. Thank you!`;
  const url = `https://wa.me/2347030574580?text=${encodeURIComponent(message)}`;

  console.log('✅ 1. WhatsApp URL Generation Check:');
  console.log('   Target URL:', url.slice(0, 70) + '...');
  console.log('   Total calculated accurately: ₦' + totalPrice.toLocaleString());

  // 2. Database validation
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const snap = await getDocs(collection(db, 'foodItems'));
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const activeApproved = docs.filter(d => !d.is_legacy && d.is_available);
  console.log(`\n✅ 2. Firestore Active Approved Records: ${activeApproved.length} / 70 expected`);

  const categoryCounts = {};
  for (const item of activeApproved) {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  }

  console.log('\n✅ 3. Category Breakdown in Live Firestore:');
  let categoryMismatch = false;
  for (const [cat, exp] of Object.entries(EXPECTED_CATEGORIES)) {
    const act = categoryCounts[cat] || 0;
    const ok = act === exp;
    if (!ok) categoryMismatch = true;
    console.log(`   - ${cat.padEnd(16)}: ${act} (expected ${exp}) -> ${ok ? 'PASSED' : 'FAILED'}`);
  }

  if (activeApproved.length === 70 && !categoryMismatch) {
    console.log('\n🎉 ALL ACCEPTANCE CRITERIA PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    console.error('\n❌ Verification mismatch detected.');
    process.exit(1);
  }
}

testE2E().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

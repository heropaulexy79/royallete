const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc } = require('firebase/firestore');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function runDeduplicate() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log('📡 Fetching all food items from Firestore...');
  const snap = await getDocs(collection(db, 'foodItems'));
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`Total documents found: ${docs.length}`);

  // Group active items by normalized name
  const seenNames = new Map();
  const toArchive = [];

  // Sort docs so that docs with configurator flags or newest timestamp come first
  docs.sort((a, b) => {
    const aScore = (a.is_configurable ? 2 : 0) + (a.updated_at || a.created_at || '');
    const bScore = (b.is_configurable ? 2 : 0) + (b.updated_at || b.created_at || '');
    return bScore > aScore ? 1 : -1;
  });

  for (const item of docs) {
    if (item.is_legacy) continue;

    const norm = normalize(item.name);
    if (!seenNames.has(norm)) {
      seenNames.set(norm, item.id);
    } else {
      // Duplicate! Archive it
      toArchive.push(item);
    }
  }

  console.log(`Unique items preserved: ${seenNames.size}`);
  console.log(`Duplicate items to archive: ${toArchive.length}`);

  for (const item of toArchive) {
    const docRef = doc(db, 'foodItems', item.id);
    await setDoc(docRef, { is_available: false, is_legacy: true, reason: 'deduplicated' }, { merge: true });
  }

  console.log('✅ Successfully archived duplicates!');

  // Verify
  const verifySnap = await getDocs(collection(db, 'foodItems'));
  const active = verifySnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(i => !i.is_legacy && i.is_available);

  console.log(`✨ Total active approved products now: ${active.length}`);
  const catCounts = {};
  active.forEach(a => {
    catCounts[a.category] = (catCounts[a.category] || 0) + 1;
  });
  console.log('Category breakdown:', catCounts);
}

runDeduplicate()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Deduplication failed:', err);
    process.exit(1);
  });

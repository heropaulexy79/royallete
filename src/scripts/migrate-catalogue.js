const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc, addDoc } = require('firebase/firestore');
const path = require('path');
const fs = require('fs');

// Load .env.local
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getApprovedCatalogue() {
  const tsContent = fs.readFileSync(path.resolve(__dirname, '../data/approvedCatalogue.ts'), 'utf8');
  const match = tsContent.match(/export const APPROVED_CATALOGUE: ApprovedProductSeed\[\] = (\[[\s\S]*?\]);\s*$/);
  if (!match) throw new Error('Could not parse APPROVED_CATALOGUE');
  return eval(match[1]);
}

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function runMigration() {
  const isApply = process.argv.includes('--apply');
  console.log(`\n======================================================`);
  console.log(`🚀 DÉSKILZ SAFE CATALOGUE MIGRATION ENGINE`);
  console.log(`Mode: ${isApply ? '⚡ LIVE APPLY' : '🔍 DRY-RUN PREVIEW'}`);
  console.log(`======================================================\n`);

  if (!firebaseConfig.projectId) {
    console.error('❌ Firebase credentials missing in environment.');
    process.exit(1);
  }

  const approvedItems = getApprovedCatalogue();
  console.log(`📦 Loaded ${approvedItems.length} approved products.`);

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log('📡 Fetching existing food items from Firestore collection "foodItems"...');
  const snapshot = await getDocs(collection(db, 'foodItems'));
  const existingDocs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  console.log(`📋 Found ${existingDocs.length} existing items in Firestore.`);

  const backupDir = path.resolve(__dirname, '../../backup');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `foodItems_pre_migration_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(existingDocs, null, 2));
  console.log(`💾 Pre-migration backup saved to: ${backupPath}`);

  const plan = {
    updates: [],
    creates: [],
    legacyArchived: [],
  };

  const matchedExistingIds = new Set();

  for (const approved of approvedItems) {
    const normApproved = normalize(approved.name);

    let match = existingDocs.find((ex) => {
      if (matchedExistingIds.has(ex.id)) return false;
      return normalize(ex.name) === normApproved;
    });

    if (!match) {
      match = existingDocs.find((ex) => {
        if (matchedExistingIds.has(ex.id)) return false;
        const normEx = normalize(ex.name);
        return normApproved.includes(normEx) || normEx.includes(normApproved);
      });
    }

    if (match) {
      matchedExistingIds.add(match.id);
      plan.updates.push({
        id: match.id,
        existing: match,
        newItem: {
          ...approved,
          image_url: match.image_url && match.image_url.startsWith('http') ? match.image_url : approved.image_url,
          updated_at: new Date().toISOString(),
        },
      });
    } else {
      plan.creates.push({
        ...approved,
        created_at: new Date().toISOString(),
      });
    }
  }

  // Mark unmatched legacy records for archiving (preserves ID and data, marks unavailable so customer menu displays only approved catalogue)
  for (const ex of existingDocs) {
    if (!matchedExistingIds.has(ex.id)) {
      plan.legacyArchived.push({
        id: ex.id,
        name: ex.name,
      });
    }
  }

  console.log('\n📊 Migration Plan Summary:');
  console.log(`- Approved Records to Update (preserving IDs): ${plan.updates.length}`);
  console.log(`- Approved Records to Create: ${plan.creates.length}`);
  console.log(`- Legacy Records to Archive (marked inactive): ${plan.legacyArchived.length}`);
  console.log(`- Total Approved Items in Final Catalogue: ${approvedItems.length}`);

  if (!isApply) {
    console.log('\n💡 This was a DRY-RUN. To execute live against Firestore, run:');
    console.log('   node src/scripts/migrate-catalogue.js --apply\n');
    return;
  }

  console.log('\n⏳ Applying migration to Firestore...');
  let updateSuccess = 0;
  let createSuccess = 0;
  let archiveSuccess = 0;

  for (const item of plan.updates) {
    const docRef = doc(db, 'foodItems', item.id);
    await setDoc(docRef, item.newItem, { merge: true });
    updateSuccess++;
  }

  for (const item of plan.creates) {
    await addDoc(collection(db, 'foodItems'), item);
    createSuccess++;
  }

  for (const item of plan.legacyArchived) {
    const docRef = doc(db, 'foodItems', item.id);
    await setDoc(docRef, { is_available: false, is_legacy: true, requires_review: true }, { merge: true });
    archiveSuccess++;
  }

  console.log(`\n✅ Migration Execution Completed!`);
  console.log(`- Updated: ${updateSuccess}`);
  console.log(`- Created: ${createSuccess}`);
  console.log(`- Legacy Archived: ${archiveSuccess}`);

  console.log('\n🔍 Verifying by reading back from Firestore...');
  const verifySnap = await getDocs(collection(db, 'foodItems'));
  const allVerified = verifySnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const activeApproved = allVerified.filter((i) => !i.is_legacy && i.is_available);
  console.log(`✨ Total records in "foodItems": ${allVerified.length}`);
  console.log(`✨ Total active approved products: ${activeApproved.length}`);

  const reportPath = path.join(backupDir, `migration_report_${Date.now()}.json`);
  const report = {
    timestamp: new Date().toISOString(),
    totalApprovedInCatalogue: approvedItems.length,
    updatedCount: updateSuccess,
    createdCount: createSuccess,
    legacyArchivedCount: archiveSuccess,
    totalInFirestoreAfter: allVerified.length,
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📝 Migration report saved to: ${reportPath}\n`);
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

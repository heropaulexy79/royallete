const fs = require('fs');
const path = require('path');

// Read the approvedCatalogue file and count items per category
const code = fs.readFileSync(path.resolve('src/data/approvedCatalogue.ts'), 'utf8');

const expectedCounts = {
  'Shawarma': 12,
  'Pizza': 9,
  'Burger': 2,
  'Chicken & Chips': 4,
  'Food': 8,
  'Drinks': 18,
  'Ice Cream': 12,
  'Snacks': 5
};

const categoryRegex = /category:\s*'([^']+)'/g;
const counts = {};
let match;
let total = 0;

while ((match = categoryRegex.exec(code)) !== null) {
  const cat = match[1];
  counts[cat] = (counts[cat] || 0) + 1;
  total++;
}

console.log('Category Counts in Approved Catalogue:');
let hasMismatch = false;
for (const [cat, expected] of Object.entries(expectedCounts)) {
  const actual = counts[cat] || 0;
  const ok = actual === expected;
  if (!ok) hasMismatch = true;
  console.log(`- ${cat}: ${actual} / expected ${expected} -> ${ok ? '✅ OK' : '❌ MISMATCH'}`);
}
console.log(`Total Products: ${total} / expected 70 -> ${total === 70 && !hasMismatch ? '✅ ALL PERFECT' : '❌ ERROR'}`);

if (total !== 70 || hasMismatch) {
  process.exit(1);
}

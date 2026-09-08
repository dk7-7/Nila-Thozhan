import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const inputDir = 'C:/Users/dilip/.gemini/antigravity-ide/brain/170108c0-0cd8-4d6e-a753-c21c7edfab73/.user_uploaded/';
const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.csv'));

const districtCounts = {};

for (const file of files) {
  const content = fs.readFileSync(path.join(inputDir, file), 'utf8');
  let records;
  try {
    records = parse(content, { columns: true, skip_empty_lines: true });
  } catch (e) {
    console.log('Parse error in', file, e.message);
    continue;
  }

  for (const row of records) {
    const dName = (row['District Name'] || '').trim();
    districtCounts[dName] = (districtCounts[dName] || 0) + 1;
  }
}

console.log('Unique districts found:', JSON.stringify(districtCounts, null, 2));

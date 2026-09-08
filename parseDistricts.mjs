import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const inputDir = 'C:/Users/dilip/.gemini/antigravity-ide/brain/170108c0-0cd8-4d6e-a753-c21c7edfab73/.user_uploaded/';
const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.csv'));

const DISTRICT_COORDS = {
  'Thoothukkudi': { lat: 8.7642, lng: 78.1348 },
  'Perambalur': { lat: 11.2333, lng: 78.8833 },
  'The Nilgiris': { lat: 11.4000, lng: 76.7000 },
};

const processedVillages = new Set();
const dataset = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(inputDir, file), 'utf8');
  let records;
  try {
    records = parse(content, { columns: true, skip_empty_lines: true });
  } catch (e) {
    continue; // handle potential parse errors gracefully
  }

  for (const row of records) {
    const dName = (row['District Name'] || '').trim();
    const vCode = (row['Village Code'] || '').replace(/'/g, '').trim();
    if (!vCode || processedVillages.has(vCode) || !DISTRICT_COORDS[dName]) continue;

    processedVillages.add(vCode);

    const vName = (row['Village Name'] || '').trim();
    const subDistName = (row['Sub District Name'] || '').trim();
    const area = parseFloat(row['Total Geographical Area (in Hectares)']) || 0;
    const hh = parseInt(row['Total  Households '], 10) || 0;
    const pop = parseInt(row['Total Population of Village'], 10) || 0;
    const crop1 = (row['Agricultural Commodities (First)'] || '').trim();
    const crop2 = (row['Agricultural Commodities (Second)'] || '').trim();

    // random small offset for coordinates
    const offsetLat = (Math.random() - 0.5) * 0.4;
    const offsetLng = (Math.random() - 0.5) * 0.4;

    const lat = DISTRICT_COORDS[dName].lat + offsetLat;
    const lng = DISTRICT_COORDS[dName].lng + offsetLng;

    dataset.push({
      villageCode: vCode,
      villageName: vName,
      subDistrictName: subDistName,
      districtName: dName,
      areaHectares: area,
      areaAcres: Math.round(area * 2.47105),
      households: hh,
      population: pop,
      primaryCrop: crop1 === 'NA' ? '' : crop1,
      secondaryCrop: crop2 === 'NA' ? '' : crop2,
      lat: Number(lat.toFixed(4)),
      lng: Number(lng.toFixed(4))
    });
  }
}

const outFile = 'src/data/otherDistrictsDataset.ts';
const fileContent = `import { GisParcelData } from '../types';

export interface VillageData {
  villageCode: string;
  villageName: string;
  subDistrictName: string;
  districtName: string;
  areaHectares: number;
  areaAcres: number;
  households: number;
  population: number;
  primaryCrop: string;
  secondaryCrop: string;
  lat: number;
  lng: number;
}

export const OTHER_DISTRICTS_VILLAGES: VillageData[] = ${JSON.stringify(dataset, null, 2)};

export const getOtherDistrictsGeneratedParcels = (): {
  parcels: GisParcelData[];
  geoPolygons: Record<string, import('leaflet').LatLngExpression[]>;
} => {
  const parcels: GisParcelData[] = [];
  const geoPolygons: Record<string, import('leaflet').LatLngExpression[]> = {};

  OTHER_DISTRICTS_VILLAGES.forEach((v, index) => {
    const pId = \`TN-OTH-VIL-\${v.villageCode}\`;
    const surveyNo = \`\${(index + 1) * 3 + 12}/\${(index % 4) + 1}A\`;
    const isConflict = index % 11 === 0;

    const area = v.areaAcres;

    // Polygon Lat/Lng geometry around village center
    const delta = 0.0035;
    const coords: import('leaflet').LatLngExpression[] = [
      [v.lat - delta, v.lng - delta],
      [v.lat + delta, v.lng - delta + 0.001],
      [v.lat + delta - 0.001, v.lng + delta],
      [v.lat - delta, v.lng + delta - 0.001],
    ];

    geoPolygons[pId] = coords;

    parcels.push({
      parcelId: pId,
      surveyNumber: surveyNo,
      village: \`\${v.villageName} (\${v.subDistrictName}, \${v.districtName})\`,
      areaAcres: area,
      centroid: { x: 300, y: 200 },
      coordinates: [
        [150, 100],
        [350, 90],
        [360, 250],
        [140, 260],
      ],
      landUse: \`\${v.primaryCrop} Agriculture \${v.secondaryCrop ? \`& \${v.secondaryCrop}\` : ''}\`.trim(),
      waterBodyAdjacent: index % 2 === 0,
      roadAccess: true,
      historicalBoundaryMatch: !isConflict,
      spatialConflict: isConflict,
      status: isConflict ? 'CONFLICT' : 'VERIFIED',
    });
  });

  return { parcels, geoPolygons };
};
`;

fs.writeFileSync(outFile, fileContent, 'utf8');
console.log('Successfully generated ' + dataset.length + ' villages in ' + outFile);

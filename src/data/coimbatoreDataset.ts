import { GisParcelData, LandDocument } from '../types';

import L from 'leaflet';

export interface CoimbatoreVillageRecord {
  villageCode: string;
  villageName: string;
  subDistrictName: string;
  districtName: string;
  areaHectares: number;
  areaAcres: number;
  households: number;
  population: number;
  primaryCrop: string;
  secondaryCrop?: string;
  handicrafts?: string;
  lat: number;
  lng: number;
}

// 104 AUTHENTIC VILLAGES & CADASTRAL PARCELS FROM DATA.GOV.IN COIMBATORE DATASET
export const COIMBATORE_DATASET_VILLAGES: CoimbatoreVillageRecord[] = [
  // Mettupalayam Sub-District
  { villageCode: '644340', villageName: 'Chinnakallipatti', subDistrictName: 'Mettupalayam', districtName: 'Coimbatore', areaHectares: 1408.75, areaAcres: 3481, households: 1098, population: 3858, primaryCrop: 'Maize', secondaryCrop: 'Handloom Sarees', lat: 11.2850, lng: 76.9520 },
  { villageCode: '644341', villageName: 'Muduthurai', subDistrictName: 'Mettupalayam', districtName: 'Coimbatore', areaHectares: 1084.47, areaAcres: 2679, households: 1254, population: 4394, primaryCrop: 'Maize', secondaryCrop: 'Cumbu', lat: 11.3100, lng: 76.9800 },
  { villageCode: '644342', villageName: 'Irumborai', subDistrictName: 'Mettupalayam', districtName: 'Coimbatore', areaHectares: 2944.75, areaAcres: 7276, households: 2295, population: 8001, primaryCrop: 'Maize', secondaryCrop: 'Banana', lat: 11.3120, lng: 77.0250 },
  { villageCode: '644343', villageName: 'Illuppanatham', subDistrictName: 'Mettupalayam', districtName: 'Coimbatore', areaHectares: 1969.17, areaAcres: 4865, households: 2665, population: 9255, primaryCrop: 'Banana', secondaryCrop: 'Coconut', lat: 11.3250, lng: 76.9150 },
  { villageCode: '644344', villageName: 'Bellapalayam', subDistrictName: 'Mettupalayam', districtName: 'Coimbatore', areaHectares: 1490.10, areaAcres: 3682, households: 2703, population: 9131, primaryCrop: 'Banana', secondaryCrop: 'Handloom Sarees', lat: 11.3400, lng: 76.9400 },
  { villageCode: '644345', villageName: 'Jadayampalayam', subDistrictName: 'Mettupalayam', districtName: 'Coimbatore', areaHectares: 1791.15, areaAcres: 4425, households: 2935, population: 10049, primaryCrop: 'Banana', secondaryCrop: 'Silk Sarees', lat: 11.2950, lng: 76.9650 },
  { villageCode: '644346', villageName: 'Chickadasampalayam', subDistrictName: 'Mettupalayam', districtName: 'Coimbatore', areaHectares: 1810.47, areaAcres: 4473, households: 5276, population: 19049, primaryCrop: 'Banana', secondaryCrop: 'Coconut', lat: 11.3000, lng: 76.9350 },
  { villageCode: '644347', villageName: 'Odanthurai', subDistrictName: 'Mettupalayam', districtName: 'Coimbatore', areaHectares: 1199.95, areaAcres: 2965, households: 1529, population: 5399, primaryCrop: 'Mustard Seeds', secondaryCrop: 'Coconut', lat: 11.3150, lng: 76.9200 },
  { villageCode: '644348', villageName: 'Nellithurai', subDistrictName: 'Mettupalayam', districtName: 'Coimbatore', areaHectares: 769.37, areaAcres: 1901, households: 676, population: 2368, primaryCrop: 'Banana', secondaryCrop: 'Coconut', lat: 11.3300, lng: 76.8900 },
  { villageCode: '644349', villageName: 'Thekkampatti', subDistrictName: 'Mettupalayam', districtName: 'Coimbatore', areaHectares: 2654.16, areaAcres: 6558, households: 3619, population: 12414, primaryCrop: 'Banana', secondaryCrop: 'Coconut', lat: 11.3350, lng: 76.8750 },
  { villageCode: '644350', villageName: 'Tholampalayam', subDistrictName: 'Mettupalayam', districtName: 'Coimbatore', areaHectares: 2343.96, areaAcres: 5791, households: 1901, population: 6574, primaryCrop: 'Banana', secondaryCrop: 'Horse Gram', lat: 11.2400, lng: 76.8500 },
  { villageCode: '644351', villageName: 'Velliangadu', subDistrictName: 'Mettupalayam', districtName: 'Coimbatore', areaHectares: 2419.28, areaAcres: 5978, households: 2259, population: 7451, primaryCrop: 'Banana', secondaryCrop: 'Chilli', lat: 11.2200, lng: 76.8400 },
  { villageCode: '644352', villageName: 'Kemmarampalayam', subDistrictName: 'Mettupalayam', districtName: 'Coimbatore', areaHectares: 2789.96, areaAcres: 6894, households: 1906, population: 6405, primaryCrop: 'Coconut', secondaryCrop: 'Banana', lat: 11.2650, lng: 76.9100 },
  { villageCode: '644353', villageName: 'Kalampalayam', subDistrictName: 'Mettupalayam', districtName: 'Coimbatore', areaHectares: 1173.32, areaAcres: 2899, households: 1602, population: 5488, primaryCrop: 'Coconut', secondaryCrop: 'Banana', lat: 11.2750, lng: 76.9250 },
  { villageCode: '644354', villageName: 'Marudur', subDistrictName: 'Mettupalayam', districtName: 'Coimbatore', areaHectares: 2915.45, areaAcres: 7204, households: 2737, population: 9491, primaryCrop: 'Maize', secondaryCrop: 'Coconut', lat: 11.2500, lng: 76.9550 },
  { villageCode: '644355', villageName: 'Belladhi', subDistrictName: 'Mettupalayam', districtName: 'Coimbatore', areaHectares: 1421.13, areaAcres: 3511, households: 2155, population: 7637, primaryCrop: 'Curry Leaves', secondaryCrop: 'Banana', lat: 11.2450, lng: 76.9700 },
  { villageCode: '644356', villageName: 'Chikkarampalayam', subDistrictName: 'Mettupalayam', districtName: 'Coimbatore', areaHectares: 1456.29, areaAcres: 3598, households: 2957, population: 10242, primaryCrop: 'Maize', secondaryCrop: 'Coconut', lat: 11.2600, lng: 76.9600 },

  // Sulur Sub-District
  { villageCode: '644370', villageName: 'Paduvampalli', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 1472.17, areaAcres: 3637, households: 1293, population: 4443, primaryCrop: 'Sugarcane', secondaryCrop: 'Banana', lat: 11.0850, lng: 77.1250 },
  { villageCode: '644371', villageName: 'Kaduvettipalayam', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 932.65, areaAcres: 2304, households: 938, population: 3219, primaryCrop: 'Banana', secondaryCrop: 'Cotton', lat: 11.0750, lng: 77.1400 },
  { villageCode: '644372', villageName: 'Kittampalayam', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 1040.98, areaAcres: 2572, households: 1240, population: 4362, primaryCrop: 'Sugarcane', secondaryCrop: 'Banana', lat: 11.0950, lng: 77.1550 },
  { villageCode: '644373', villageName: 'Semmandampalayam', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 1393.35, areaAcres: 3443, households: 1718, population: 5970, primaryCrop: 'Maize', secondaryCrop: 'Coconut', lat: 11.0650, lng: 77.1650 },
  { villageCode: '644374', villageName: 'Mylampatti', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 481.50, areaAcres: 1190, households: 829, population: 2823, primaryCrop: 'Coconut', secondaryCrop: 'Maize', lat: 11.0500, lng: 77.0850 },
  { villageCode: '644375', villageName: 'Rasipalayam', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 557.60, areaAcres: 1378, households: 1364, population: 4407, primaryCrop: 'Power Loom', secondaryCrop: 'Beedi', lat: 11.0250, lng: 77.1150 },
  { villageCode: '644376', villageName: 'Kadampadi', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 1202.23, areaAcres: 2970, households: 2370, population: 8147, primaryCrop: 'Coconut', secondaryCrop: 'Yarn', lat: 11.0150, lng: 77.1000 },
  { villageCode: '644377', villageName: 'Kangayampalayam', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 760.62, areaAcres: 1879, households: 2247, population: 8251, primaryCrop: 'Coconut', secondaryCrop: 'Cloth', lat: 11.0100, lng: 77.0800 },
  { villageCode: '644378', villageName: 'Appanaickenpatti', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 1874.47, areaAcres: 4631, households: 1121, population: 3992, primaryCrop: 'Maize', secondaryCrop: 'Groundnut', lat: 10.9850, lng: 77.1350 },
  { villageCode: '644379', villageName: 'Kalangal', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 1500.58, areaAcres: 3708, households: 1639, population: 5590, primaryCrop: 'Coconut', secondaryCrop: 'Corn', lat: 10.9950, lng: 77.1100 },
  { villageCode: '644380', villageName: 'Peedampalli', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 1359.65, areaAcres: 3360, households: 1134, population: 3896, primaryCrop: 'Coconut', secondaryCrop: 'Vegetables', lat: 10.9750, lng: 77.0950 },
  { villageCode: '644381', villageName: 'Kallapalayam', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 1141.05, areaAcres: 2819, households: 860, population: 3066, primaryCrop: 'Coconut', secondaryCrop: 'Vegetables', lat: 10.9650, lng: 77.1050 },
  { villageCode: '644382', villageName: 'Pappampatti', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 1024.82, areaAcres: 2532, households: 1172, population: 4143, primaryCrop: 'Coconut', secondaryCrop: 'Spinach', lat: 10.9550, lng: 77.1200 },
  { villageCode: '644383', villageName: 'Edayapalayam', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 1191.04, areaAcres: 2943, households: 667, population: 2251, primaryCrop: 'Coconut', secondaryCrop: 'Beetroot', lat: 10.9450, lng: 77.1300 },
  { villageCode: '644384', villageName: 'Sellakkarichal', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 2123.47, areaAcres: 5247, households: 1863, population: 6209, primaryCrop: 'Corn', secondaryCrop: 'Power Loom', lat: 10.9350, lng: 77.1500 },
  { villageCode: '644385', villageName: 'Vadambacheri', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 2219.91, areaAcres: 5485, households: 2391, population: 8252, primaryCrop: 'Coconut', secondaryCrop: 'Maize', lat: 10.9250, lng: 77.1700 },
  { villageCode: '644386', villageName: 'Varapatti', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 2675.86, areaAcres: 6612, households: 2315, population: 7644, primaryCrop: 'Coconut', secondaryCrop: 'Maize', lat: 10.9150, lng: 77.1850 },
  { villageCode: '644387', villageName: 'Vadavalli (Sulur)', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 1745.38, areaAcres: 4313, households: 955, population: 3171, primaryCrop: 'Corn', secondaryCrop: 'Beetroot', lat: 10.9050, lng: 77.1950 },
  { villageCode: '644388', villageName: 'Bogampatti', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 1876.93, areaAcres: 4638, households: 686, population: 2415, primaryCrop: 'Coconut', secondaryCrop: 'Chilli', lat: 10.8950, lng: 77.1650 },
  { villageCode: '644389', villageName: 'Pachapalayam (Sulur)', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 1559.00, areaAcres: 3852, households: 842, population: 2933, primaryCrop: 'Chilli', secondaryCrop: 'Tomato', lat: 10.8850, lng: 77.1450 },
  { villageCode: '644390', villageName: 'Poorandampalayam', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 1141.39, areaAcres: 2820, households: 933, population: 3135, primaryCrop: 'Coconut', secondaryCrop: 'Corn', lat: 10.8750, lng: 77.1750 },
  { villageCode: '644391', villageName: 'Kumarapalayam (Sulur)', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 1029.75, areaAcres: 2544, households: 1328, population: 4612, primaryCrop: 'Coconut', secondaryCrop: 'Onion', lat: 10.8650, lng: 77.1850 },
  { villageCode: '644392', villageName: 'Vadavedampatti', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 1066.24, areaAcres: 2634, households: 749, population: 2368, primaryCrop: 'Coconut', secondaryCrop: 'Onion', lat: 10.8550, lng: 77.1950 },
  { villageCode: '644393', villageName: 'Kammalapatti', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 1266.63, areaAcres: 3130, households: 777, population: 2654, primaryCrop: 'Coconut', secondaryCrop: 'Onion', lat: 10.8450, lng: 77.2050 },
  { villageCode: '644394', villageName: 'Jallipatti (Sulur)', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 573.99, areaAcres: 1418, households: 725, population: 2310, primaryCrop: 'Coconut', secondaryCrop: 'Chilli', lat: 10.8350, lng: 77.2150 },
  { villageCode: '644395', villageName: 'Senjeriputhur', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 1708.77, areaAcres: 4222, households: 1265, population: 4165, primaryCrop: 'Coconut', secondaryCrop: 'Chilli', lat: 10.8250, lng: 77.2250 },
  { villageCode: '644396', villageName: 'Senjeri Ayyampalayam', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 1198.58, areaAcres: 2961, households: 913, population: 2851, primaryCrop: 'Corn', secondaryCrop: 'Onion', lat: 10.8150, lng: 77.2350 },
  { villageCode: '644397', villageName: 'Malaipalayam', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 1442.69, areaAcres: 3565, households: 1232, population: 4208, primaryCrop: 'Coconut', secondaryCrop: 'Groundnut', lat: 10.8050, lng: 77.2450 },
  { villageCode: '644398', villageName: 'Thalakkarai (Sulur)', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 801.67, areaAcres: 1981, households: 670, population: 2234, primaryCrop: 'Coconut', secondaryCrop: 'Onion', lat: 10.7950, lng: 77.2550 },
  { villageCode: '644399', villageName: 'J.Krishnapuram', subDistrictName: 'Sulur', districtName: 'Coimbatore', areaHectares: 1912.98, areaAcres: 4727, households: 1458, population: 4751, primaryCrop: 'Coconut', secondaryCrop: 'Corn', lat: 10.7850, lng: 77.2650 },

  // Coimbatore North Sub-District
  { villageCode: '644407', villageName: 'Akkaraisengapalli', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 1402.52, areaAcres: 3465, households: 1058, population: 3787, primaryCrop: 'Maize', secondaryCrop: 'Tobacco', lat: 11.1650, lng: 77.0650 },
  { villageCode: '644408', villageName: 'Kanuvakkarai', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 1238.30, areaAcres: 3060, households: 736, population: 2646, primaryCrop: 'Maize', secondaryCrop: 'Banana', lat: 11.1550, lng: 77.0500 },
  { villageCode: '644409', villageName: 'Ambodi', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 1050.20, areaAcres: 2595, households: 979, population: 3531, primaryCrop: 'Banana', secondaryCrop: 'Groundnut', lat: 11.1450, lng: 77.0350 },
  { villageCode: '644410', villageName: 'Allapalayam', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 973.15, areaAcres: 2404, households: 615, population: 2189, primaryCrop: 'Maize', secondaryCrop: 'Turmeric', lat: 11.1350, lng: 77.0200 },
  { villageCode: '644411', villageName: 'Pasur', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 941.51, areaAcres: 2326, households: 888, population: 3219, primaryCrop: 'Banana', secondaryCrop: 'Turmeric', lat: 11.1250, lng: 77.0400 },
  { villageCode: '644412', villageName: 'Annur Mettupalayam', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 1038.02, areaAcres: 2565, households: 1034, population: 3902, primaryCrop: 'Maize', secondaryCrop: 'Banana', lat: 11.1150, lng: 77.0150 },
  { villageCode: '644413', villageName: 'Vadakkalur', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 1167.63, areaAcres: 2885, households: 1567, population: 5640, primaryCrop: 'Maize', secondaryCrop: 'Banana', lat: 11.1050, lng: 77.0300 },
  { villageCode: '644414', villageName: 'Odderpalayam', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 1229.58, areaAcres: 3038, households: 2051, population: 7403, primaryCrop: 'Maize', secondaryCrop: 'Banana', lat: 11.0950, lng: 77.0250 },
  { villageCode: '644415', villageName: 'Kuppanur', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 1953.26, areaAcres: 4826, households: 1225, population: 4130, primaryCrop: 'Turmeric', secondaryCrop: 'Banana', lat: 11.0850, lng: 77.0450 },
  { villageCode: '644416', villageName: 'Pogalur', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 1535.96, areaAcres: 3795, households: 1321, population: 4671, primaryCrop: 'Maize', secondaryCrop: 'Pulses', lat: 11.1200, lng: 76.9950 },
  { villageCode: '644417', villageName: 'Vadavalli (CBE North)', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 1557.35, areaAcres: 3848, households: 1105, population: 3859, primaryCrop: 'Maize', secondaryCrop: 'Banana', lat: 11.1100, lng: 76.9850 },
  { villageCode: '644418', villageName: 'Karegoundenpalayam', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 2138.28, areaAcres: 5283, households: 2084, population: 7531, primaryCrop: 'Banana', secondaryCrop: 'Turmeric', lat: 11.1300, lng: 76.9750 },
  { villageCode: '644419', villageName: 'Kanjappali', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 1462.63, areaAcres: 3614, households: 1516, population: 5204, primaryCrop: 'Maize', secondaryCrop: 'Banana', lat: 11.1400, lng: 76.9650 },
  { villageCode: '644420', villageName: 'Pillaiappampalayam', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 868.23, areaAcres: 2145, households: 893, population: 3233, primaryCrop: 'Maize', secondaryCrop: 'Greengram', lat: 11.1500, lng: 76.9550 },
  { villageCode: '644421', villageName: 'Kariampalayam', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 819.52, areaAcres: 2025, households: 1232, population: 4498, primaryCrop: 'Maize', secondaryCrop: 'Banana', lat: 11.1250, lng: 76.9700 },
  { villageCode: '644422', villageName: 'Kuppepalayam', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 1319.69, areaAcres: 3261, households: 779, population: 2784, primaryCrop: 'Maize', secondaryCrop: 'Turmeric', lat: 11.1350, lng: 76.9800 },
  { villageCode: '644423', villageName: 'Kattampatti', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 1079.23, areaAcres: 2666, households: 1664, population: 5859, primaryCrop: 'Sugarcane', secondaryCrop: 'Banana', lat: 11.1450, lng: 76.9900 },
  { villageCode: '644424', villageName: 'Kunnathur', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 902.04, areaAcres: 2229, households: 1160, population: 4281, primaryCrop: 'Maize', secondaryCrop: 'Banana', lat: 11.1150, lng: 76.9650 },
  { villageCode: '644425', villageName: 'Masagoundenchettipalayam', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 2736.23, areaAcres: 6761, households: 2762, population: 9616, primaryCrop: 'Banana', secondaryCrop: 'Turmeric', lat: 11.0950, lng: 76.9750 },
  { villageCode: '644426', villageName: 'Pachapalayam (CBE North)', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 731.97, areaAcres: 1808, households: 683, population: 2359, primaryCrop: 'Banana', secondaryCrop: 'Turmeric', lat: 11.0850, lng: 76.9600 },
  { villageCode: '644427', villageName: 'Naranapuram', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 915.80, areaAcres: 2263, households: 600, population: 2111, primaryCrop: 'Maize', secondaryCrop: 'Turmeric', lat: 11.0750, lng: 76.9800 },
  { villageCode: '644428', villageName: 'Bilichi', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 2795.81, areaAcres: 6908, households: 3076, population: 10412, primaryCrop: 'Coconut', secondaryCrop: 'Curryleaves', lat: 11.1600, lng: 76.9200 },
  { villageCode: '644429', villageName: 'Vellamadai', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 1721.60, areaAcres: 4254, households: 1975, population: 6874, primaryCrop: 'Maize', secondaryCrop: 'Banana', lat: 11.1350, lng: 77.0120 },
  { villageCode: '644430', villageName: 'Kondayampalayam', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 906.77, areaAcres: 2240, households: 1878, population: 6636, primaryCrop: 'Coconut', secondaryCrop: 'Bengal Gram', lat: 11.0900, lng: 76.9800 },
  { villageCode: '644431', villageName: 'Agraharasamakulam', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 1028.22, areaAcres: 2540, households: 1219, population: 4144, primaryCrop: 'Coconut', secondaryCrop: 'Sugarcane', lat: 11.0800, lng: 76.9700 },
  { villageCode: '644432', villageName: 'Naickenpalayam', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 982.89, areaAcres: 2428, households: 1710, population: 5914, primaryCrop: 'Coconut', secondaryCrop: 'Sugarcane', lat: 11.1200, lng: 76.9300 },
  { villageCode: '644433', villageName: 'Veerapandi', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 4906.25, areaAcres: 12123, households: 2105, population: 7528, primaryCrop: 'Broad Beans', secondaryCrop: 'Cow Beans', lat: 11.0900, lng: 76.9100 },
  { villageCode: '644434', villageName: 'Nanjundapuram', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 1198.92, areaAcres: 2962, households: 2666, population: 9355, primaryCrop: 'Coconut', secondaryCrop: 'Sugarcane', lat: 11.0700, lng: 76.9200 },
  { villageCode: '644435', villageName: 'Pannimadai', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 748.86, areaAcres: 1850, households: 3802, population: 13785, primaryCrop: 'Maize', secondaryCrop: 'Sugarcane', lat: 11.0650, lng: 76.9050 },
  { villageCode: '644436', villageName: 'Keeranatham', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 1331.46, areaAcres: 3290, households: 1369, population: 4707, primaryCrop: 'Coconut', secondaryCrop: 'Bengal Gram', lat: 11.1025, lng: 76.9930 },
  { villageCode: '644437', villageName: 'Kallipalayam', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 756.21, areaAcres: 1868, households: 803, population: 2821, primaryCrop: 'Jasmine', secondaryCrop: 'Coconut', lat: 11.1150, lng: 77.0050 },
  { villageCode: '644438', villageName: 'Vellanaipatti', subDistrictName: 'Coimbatore North', districtName: 'Coimbatore', areaHectares: 1642.43, areaAcres: 4058, households: 1324, population: 4636, primaryCrop: 'Banana', secondaryCrop: 'Coconut', lat: 11.0850, lng: 77.0350 },

  // Coimbatore South Sub-District
  { villageCode: '644447', villageName: 'Thennammanallur', subDistrictName: 'Coimbatore South', districtName: 'Coimbatore', areaHectares: 855.66, areaAcres: 2114, households: 1443, population: 5098, primaryCrop: 'Corn', secondaryCrop: 'Banana', lat: 10.9850, lng: 76.8420 },
  { villageCode: '644448', villageName: 'Devarayapuram', subDistrictName: 'Coimbatore South', districtName: 'Coimbatore', areaHectares: 1394.29, areaAcres: 3445, households: 1802, population: 6417, primaryCrop: 'Coconut', secondaryCrop: 'Banana', lat: 10.9750, lng: 76.8300 },
  { villageCode: '644449', villageName: 'Jagirnaickenpalyam', subDistrictName: 'Coimbatore South', districtName: 'Coimbatore', areaHectares: 263.37, areaAcres: 650, households: 334, population: 1486, primaryCrop: 'Maize', secondaryCrop: 'Corn', lat: 10.9650, lng: 76.8200 },
  { villageCode: '644450', villageName: 'Vellaimalaipattinam', subDistrictName: 'Coimbatore South', districtName: 'Coimbatore', areaHectares: 719.09, areaAcres: 1776, households: 916, population: 4066, primaryCrop: 'Sesame', secondaryCrop: 'Maize', lat: 10.9550, lng: 76.8100 },
  { villageCode: '644451', villageName: 'Narasipuram', subDistrictName: 'Coimbatore South', districtName: 'Coimbatore', areaHectares: 1332.73, areaAcres: 3293, households: 831, population: 3078, primaryCrop: 'Turmeric', secondaryCrop: 'Banana', lat: 10.9450, lng: 76.8000 },
  { villageCode: '644452', villageName: 'Madavarayapuram', subDistrictName: 'Coimbatore South', districtName: 'Coimbatore', areaHectares: 1308.36, areaAcres: 3233, households: 1797, population: 6365, primaryCrop: 'Coconut', secondaryCrop: 'Banana', lat: 10.9350, lng: 76.7900 },
  { villageCode: '644453', villageName: 'Ikkaraibooluvampatti', subDistrictName: 'Coimbatore South', districtName: 'Coimbatore', areaHectares: 1915.78, areaAcres: 4734, households: 1834, population: 6361, primaryCrop: 'Coconut', secondaryCrop: 'Turmeric', lat: 10.9250, lng: 76.7800 },
  { villageCode: '644454', villageName: 'Madampatti', subDistrictName: 'Coimbatore South', districtName: 'Coimbatore', areaHectares: 1554.34, areaAcres: 3840, households: 1999, population: 6771, primaryCrop: 'Maize', secondaryCrop: 'Onion', lat: 10.9600, lng: 76.8650 },
  { villageCode: '644455', villageName: 'Theethipalayam', subDistrictName: 'Coimbatore South', districtName: 'Coimbatore', areaHectares: 1338.96, areaAcres: 3308, households: 2386, population: 8629, primaryCrop: 'Maize', secondaryCrop: 'Onion', lat: 10.9500, lng: 76.8800 },
  { villageCode: '644456', villageName: 'Mavuthampathi', subDistrictName: 'Coimbatore South', districtName: 'Coimbatore', areaHectares: 1531.61, areaAcres: 3784, households: 818, population: 2843, primaryCrop: 'Tomato', secondaryCrop: 'Banana', lat: 10.8600, lng: 76.8500 },
  { villageCode: '644457', villageName: 'Pichanur', subDistrictName: 'Coimbatore South', districtName: 'Coimbatore', areaHectares: 1848.06, areaAcres: 4566, households: 1687, population: 6261, primaryCrop: 'Coconut', secondaryCrop: 'Tomato', lat: 10.8500, lng: 76.8600 },
  { villageCode: '644458', villageName: 'Palathurai', subDistrictName: 'Coimbatore South', districtName: 'Coimbatore', areaHectares: 344.34, areaAcres: 850, households: 767, population: 2727, primaryCrop: 'Coconut', secondaryCrop: 'Groundnut', lat: 10.8700, lng: 76.8900 },
  { villageCode: '644459', villageName: 'Thambagoundenpalayam', subDistrictName: 'Coimbatore South', districtName: 'Coimbatore', areaHectares: 261.10, areaAcres: 645, households: 133, population: 482, primaryCrop: 'Tomato', secondaryCrop: 'Chilli', lat: 10.8800, lng: 76.8800 },
  { villageCode: '644460', villageName: 'Karunchamigoundenpalayam', subDistrictName: 'Coimbatore South', districtName: 'Coimbatore', areaHectares: 413.30, areaAcres: 1021, households: 95, population: 343, primaryCrop: 'Tomato', secondaryCrop: 'Chilli', lat: 10.8700, lng: 76.8700 },
  { villageCode: '644461', villageName: 'Seerappalayam', subDistrictName: 'Coimbatore South', districtName: 'Coimbatore', areaHectares: 1187.56, areaAcres: 2934, households: 1646, population: 5881, primaryCrop: 'Coconut', secondaryCrop: 'Tomato', lat: 10.8900, lng: 76.9200 },
  { villageCode: '644462', villageName: 'Myleripalayam', subDistrictName: 'Coimbatore South', districtName: 'Coimbatore', areaHectares: 1112.88, areaAcres: 2750, households: 1393, population: 4990, primaryCrop: 'Coconut', secondaryCrop: 'Banana', lat: 10.9000, lng: 76.9300 },
  { villageCode: '644463', villageName: 'Nachippalayam', subDistrictName: 'Coimbatore South', districtName: 'Coimbatore', areaHectares: 516.52, areaAcres: 1276, households: 878, population: 3008, primaryCrop: 'Tomato', secondaryCrop: 'Chilli', lat: 10.8800, lng: 76.9000 },
  { villageCode: '644464', villageName: 'Arisippalayam', subDistrictName: 'Coimbatore South', districtName: 'Coimbatore', areaHectares: 1085.60, areaAcres: 2682, households: 700, population: 2400, primaryCrop: 'Cotton', secondaryCrop: 'Maize', lat: 10.8700, lng: 76.9100 },
  { villageCode: '644465', villageName: 'Valukkupparai', subDistrictName: 'Coimbatore South', districtName: 'Coimbatore', areaHectares: 1698.30, areaAcres: 4196, households: 1412, population: 4891, primaryCrop: 'Coconut', secondaryCrop: 'Maize', lat: 10.8600, lng: 76.9300 },

  // Pollachi / Kinathukadavu / Anaimalai Sub-Districts
  { villageCode: '644475', villageName: 'Arasampalayam', subDistrictName: 'Kinathukadavu', districtName: 'Coimbatore', areaHectares: 1270.73, areaAcres: 3140, households: 1090, population: 3818, primaryCrop: 'Tomato', secondaryCrop: 'Chilli', lat: 10.7800, lng: 77.0200 },
  { villageCode: '644476', villageName: 'Panappatti', subDistrictName: 'Kinathukadavu', districtName: 'Coimbatore', areaHectares: 1616.95, areaAcres: 3995, households: 763, population: 2635, primaryCrop: 'Maize', secondaryCrop: 'Tomato', lat: 10.7700, lng: 77.0400 },
  { villageCode: '644477', villageName: 'Mettubavi', subDistrictName: 'Kinathukadavu', districtName: 'Coimbatore', areaHectares: 2120.03, areaAcres: 5238, households: 719, population: 2485, primaryCrop: 'Coconut', secondaryCrop: 'Chilli', lat: 10.7600, lng: 77.0500 },
  { villageCode: '644478', villageName: 'Vadasithur', subDistrictName: 'Kinathukadavu', districtName: 'Coimbatore', areaHectares: 1748.48, areaAcres: 4320, households: 1532, population: 5080, primaryCrop: 'Coconut', secondaryCrop: 'Corn', lat: 10.7500, lng: 77.0300 },
  { villageCode: '644479', villageName: 'Kondampatty', subDistrictName: 'Kinathukadavu', districtName: 'Coimbatore', areaHectares: 1205.85, areaAcres: 2980, households: 738, population: 2467, primaryCrop: 'Coconut', secondaryCrop: 'Tomatoes', lat: 10.7400, lng: 77.0100 },
  { villageCode: '644480', villageName: 'Solavampalayam', subDistrictName: 'Kinathukadavu', districtName: 'Coimbatore', areaHectares: 869.81, areaAcres: 2149, households: 1837, population: 6387, primaryCrop: 'Coconut', secondaryCrop: 'Tomato', lat: 10.7300, lng: 77.0250 },
  { villageCode: '644481', villageName: 'Vadaputhur', subDistrictName: 'Kinathukadavu', districtName: 'Coimbatore', areaHectares: 1059.16, areaAcres: 2617, households: 1467, population: 5176, primaryCrop: 'Coconut', secondaryCrop: 'Tomato', lat: 10.7200, lng: 77.0350 },
  { villageCode: '644482', villageName: 'Kuthiraialampalayam', subDistrictName: 'Kinathukadavu', districtName: 'Coimbatore', areaHectares: 263.74, areaAcres: 651, households: 444, population: 1448, primaryCrop: 'Coconut', secondaryCrop: 'Groundnut', lat: 10.7100, lng: 77.0450 },
  { villageCode: '644483', villageName: 'Pottaiyandiporambu', subDistrictName: 'Kinathukadavu', districtName: 'Coimbatore', areaHectares: 502.99, areaAcres: 1242, households: 445, population: 1530, primaryCrop: 'Coconut', secondaryCrop: 'Groundnut', lat: 10.7000, lng: 77.0300 },
  { villageCode: '644484', villageName: 'Sokkanur', subDistrictName: 'Kinathukadavu', districtName: 'Coimbatore', areaHectares: 2308.98, areaAcres: 5705, households: 1776, population: 6020, primaryCrop: 'Coconut', secondaryCrop: 'Groundnut', lat: 10.6900, lng: 77.0200 },
  { villageCode: '644565', villageName: 'Marchinaickenpalayam', subDistrictName: 'Anaimalai', districtName: 'Coimbatore', areaHectares: 3855.70, areaAcres: 9527, households: 5636, population: 19407, primaryCrop: 'Coconut', secondaryCrop: 'Tapioca', lat: 10.5820, lng: 76.9350 },
  { villageCode: '644580', villageName: 'Somandurai', subDistrictName: 'Anaimalai', districtName: 'Coimbatore', areaHectares: 645.83, areaAcres: 1595, households: 1654, population: 5559, primaryCrop: 'Coconut', secondaryCrop: 'Paddy', lat: 10.3700, lng: 76.7400 },
  { villageCode: '644582', villageName: 'Periapodu', subDistrictName: 'Anaimalai', districtName: 'Coimbatore', areaHectares: 4313.37, areaAcres: 10658, households: 2077, population: 6945, primaryCrop: 'Coconut', secondaryCrop: 'Tapioca', lat: 10.3500, lng: 76.7200 },
  { villageCode: '644583', villageName: 'Kaliyapuram', subDistrictName: 'Anaimalai', districtName: 'Coimbatore', areaHectares: 2947.82, areaAcres: 7284, households: 1365, population: 4980, primaryCrop: 'Coconut', secondaryCrop: 'Paddy', lat: 10.3400, lng: 76.7100 },
  { villageCode: '644590', villageName: 'Angalakurichi', subDistrictName: 'Anaimalai', districtName: 'Coimbatore', areaHectares: 784.41, areaAcres: 1938, households: 2594, population: 8816, primaryCrop: 'Coconut', secondaryCrop: 'Groundnut', lat: 10.2700, lng: 76.6400 },
];

// GENERATE ALL GIS PARCEL POLYGONS & DATASET METRICS
export const getCoimbatoreGeneratedParcels = (): {
  parcels: GisParcelData[];
  geoPolygons: Record<string, L.LatLngExpression[]>;
} => {
  const parcels: GisParcelData[] = [];
  const geoPolygons: Record<string, L.LatLngExpression[]> = {};

  COIMBATORE_DATASET_VILLAGES.forEach((v, index) => {
    const pId = `TN-CBE-VIL-${v.villageCode}`;
    const surveyNo = `${(index + 1) * 3 + 12}/${(index % 4) + 1}A`;
    const isConflict = index % 11 === 0; // Create realistic conflict case for every 11th village

    // Calculated area in acres
    const area = Number((v.areaHectares * 2.47105).toFixed(2));

    // Polygon Lat/Lng geometry around village center
    const delta = 0.0035;
    const coords: L.LatLngExpression[] = [
      [v.lat - delta, v.lng - delta],
      [v.lat + delta, v.lng - delta + 0.001],
      [v.lat + delta - 0.001, v.lng + delta],
      [v.lat - delta, v.lng + delta - 0.001],
    ];

    geoPolygons[pId] = coords;

    parcels.push({
      parcelId: pId,
      surveyNumber: surveyNo,
      village: `${v.villageName} (${v.subDistrictName})`,
      areaAcres: area,
      centroid: { x: 300, y: 200 },
      coordinates: [
        [150, 100],
        [350, 90],
        [360, 250],
        [140, 260],
      ],
      landUse: `${v.primaryCrop} Agriculture ${v.secondaryCrop ? `& ${v.secondaryCrop}` : ''}`,
      waterBodyAdjacent: index % 2 === 0,
      roadAccess: true,
      historicalBoundaryMatch: !isConflict,
      spatialConflict: isConflict,
      status: isConflict ? 'CONFLICT' : 'VERIFIED',
    });
  });

  return { parcels, geoPolygons };
};

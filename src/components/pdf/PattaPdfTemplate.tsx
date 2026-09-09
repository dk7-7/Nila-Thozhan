import React from 'react';
import { LandDocument } from '../../types';

interface PattaPdfTemplateProps {
  document: LandDocument;
}

export const PattaPdfTemplate: React.FC<PattaPdfTemplateProps> = ({ document: doc }) => {

  // Extract dynamic values with canonical fallback handling
  const district = doc.cadastralDetails?.tamilDistrict || doc.district || 'செங்கல்பட்டு';
  const taluk = doc.cadastralDetails?.tamilTaluk || doc.taluk || 'தாம்பரம்';
  const village = doc.cadastralDetails?.tamilVillage || doc.village || 'வண்டலூர்';
  
  // Extract Patta Number (clean numeric / string without extra label prefix)
  const rawPatta = doc.cadastralDetails?.pattaNumber || doc.extractedFields?.pattaNumber?.value || '4082';
  const pattaNumber = rawPatta.replace(/patta\s*(no\.?)?/i, '').trim() || '4082';

  // Owner Name (Tamil preference with English fallback)
  const ownerName = doc.cadastralDetails?.tamilOwnerName || doc.ownerName || 'திரு M. செல்வராஜ்';

  // Determine land classification & table rows
  const surveyNo = doc.surveyNumber || '124/3A';
  const rawArea = doc.landArea || `${doc.landAreaNumeric || 2.45} ஏக்கர்`;
  const numericArea = doc.landAreaNumeric || 2.45;

  // Determine land classification (Nanjai / Punjai / Other)
  const landClassification = (doc.cadastralDetails?.landClassification || doc.gisParcel?.landUse || '').toLowerCase();
  
  let isNanjai = landClassification.includes('nanjai') || landClassification.includes('நன்செய்') || landClassification.includes('wetland');
  let isPunjai = landClassification.includes('punjai') || landClassification.includes('புன்செய்') || landClassification.includes('dryland');
  
  // Default to Nanjai if neither specified, to match Tamil Nadu agricultural default
  if (!isNanjai && !isPunjai) {
    isNanjai = true;
  }

  // Format Area string (Hectares / Ares / Acres)
  const formattedArea = rawArea;
  // Assessment value calculation (Tamil Nadu standard land revenue assessment per acre/hectare)
  const estimatedAssessment = (numericArea * 14.5).toFixed(2);

  // Table row data structure
  const rows = [
    {
      sno: 1,
      surveyNumber: surveyNo,
      nanjaiArea: isNanjai ? formattedArea : '-',
      nanjaiAssessment: isNanjai ? `₹ ${estimatedAssessment}` : '-',
      punjaiArea: isPunjai ? formattedArea : '-',
      punjaiAssessment: isPunjai ? `₹ ${estimatedAssessment}` : '-',
      otherArea: (!isNanjai && !isPunjai) ? formattedArea : '-',
      otherAssessment: (!isNanjai && !isPunjai) ? `₹ ${estimatedAssessment}` : '-',
      remarks: doc.officerNotes || 'நிலவுரிமை பட்டா விவரம் சரிபார்க்கப்பட்டது',
    },
  ];

  // Totals computation
  const totalNanjaiArea = isNanjai ? formattedArea : '0.00';
  const totalNanjaiAssessment = isNanjai ? `₹ ${estimatedAssessment}` : '₹ 0.00';
  
  const totalPunjaiArea = isPunjai ? formattedArea : '0.00';
  const totalPunjaiAssessment = isPunjai ? `₹ ${estimatedAssessment}` : '₹ 0.00';

  const totalOtherArea = (!isNanjai && !isPunjai) ? formattedArea : '0.00';
  const totalOtherAssessment = (!isNanjai && !isPunjai) ? `₹ ${estimatedAssessment}` : '₹ 0.00';

  // Digital Signature Details
  const sigDateStr = doc.digitalSignature?.signDate || doc.submissionDate || new Date().toISOString().split('T')[0];
  const sigTimeStr = '11:45:20';
  const officerName = doc.digitalSignature?.signerName || doc.assignedOfficer || 'Dr. V. Narayanan, IAS';
  const officerDesignation = doc.digitalSignature?.signerDesignation || 'மண்டல துணை வட்டாட்சியர் / Zonal Deputy Tahsildar';
  const officerPlace = doc.district ? `${doc.district} மாவட்டம்` : 'செங்கல்பட்டு';

  return (
    <div
      id="patta-pdf-document"
      style={{
        width: '794px', // Standard A4 width at 96 DPI
        minHeight: '1123px', // Standard A4 height at 96 DPI
        padding: '35px 45px',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: "'Noto Sans Tamil', 'Latha', 'Tamil Sangam MN', 'Mukta Malar', sans-serif",
        fontSize: '13px',
        lineHeight: '1.5',
        boxSizing: 'border-box',
        margin: '0 auto',
      }}
    >
      {/* Import Noto Sans Tamil font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700&display=swap"
      />

      {/* Outer Border Frame */}
      <div style={{ border: '2px solid #000000', padding: '20px', minHeight: '1040px', boxSizing: 'border-box' }}>
        
        {/* ================================================== */}
        {/* 1. GOVERNMENT HEADER                               */}
        {/* ================================================== */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {/* Government Emblem */}
          <img
            src="/assets/tn_emblem.svg"
            alt="Tamil Nadu Government Emblem"
            style={{ width: '85px', height: '85px', display: 'block', margin: '0 auto 8px auto' }}
          />

          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>
            தமிழ்நாடு அரசு
          </h1>
          <h2 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 4px 0' }}>
            வருவாய் மற்றும் பேரிடர் மேலாண்மைத் துறை
          </h2>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '6px 0 0 0', textDecoration: 'underline' }}>
            நில உரிமை விபரங்கள் : 10(1) பிரிவு படிவ அறிக்கை
          </h3>
        </div>

        {/* ================================================== */}
        {/* 2. LOCATION / PATTA HEADER                         */}
        {/* ================================================== */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid #000000',
            borderBottom: '1px solid #000000',
            padding: '10px 15px',
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: '600',
            backgroundColor: '#fafafa',
          }}
        >
          {/* LEFT Column */}
          <div style={{ lineHeight: '1.8' }}>
            <div><strong>மாவட்டம்:</strong> {district}</div>
            <div><strong>வட்டம்:</strong> {taluk}</div>
            <div><strong>வருவாய் கிராமம்:</strong> {village}</div>
          </div>

          {/* RIGHT Column */}
          <div style={{ lineHeight: '1.8', textAlign: 'right' }}>
            <div><strong>பட்டா எண்:</strong> <span style={{ fontSize: '15px', fontWeight: 'bold' }}>{pattaNumber}</span></div>
            <div><strong>ஆவண எண்:</strong> {doc.documentNumber || '-'}</div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 3. LAND OWNER SECTION                             */}
        {/* ================================================== */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              borderBottom: '1px stroke #000000',
              paddingBottom: '4px',
              display: 'inline-block',
              marginBottom: '8px',
            }}
          >
            உரிமையாளர்கள் பெயர்
          </div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', letterSpacing: '0.3px' }}>
            1. {ownerName}
          </div>
        </div>

        {/* ================================================== */}
        {/* 4. LAND DETAILS TABLE                              */}
        {/* ================================================== */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #000000',
            marginBottom: '20px',
            fontSize: '12px',
            textAlign: 'center',
          }}
        >
          <thead>
            {/* Header Tier 1 */}
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th rowSpan={2} style={{ border: '1px solid #000000', padding: '6px 4px', width: '6%' }}>
                வ.எண்
              </th>
              <th rowSpan={2} style={{ border: '1px solid #000000', padding: '6px 4px', width: '22%' }}>
                புல எண் மற்றும் உட்பிரிவு
              </th>
              <th colSpan={2} style={{ border: '1px solid #000000', padding: '6px 4px', width: '24%' }}>
                நன்செய்
              </th>
              <th colSpan={2} style={{ border: '1px solid #000000', padding: '6px 4px', width: '24%' }}>
                புன்செய்
              </th>
              <th colSpan={2} style={{ border: '1px solid #000000', padding: '6px 4px', width: '14%' }}>
                மற்றவை
              </th>
              <th rowSpan={2} style={{ border: '1px solid #000000', padding: '6px 4px', width: '10%' }}>
                குறிப்பு
              </th>
            </tr>
            {/* Header Tier 2 */}
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ border: '1px solid #000000', padding: '5px 4px' }}>பரப்பு</th>
              <th style={{ border: '1px solid #000000', padding: '5px 4px' }}>தீர்வை</th>
              <th style={{ border: '1px solid #000000', padding: '5px 4px' }}>பரப்பு</th>
              <th style={{ border: '1px solid #000000', padding: '5px 4px' }}>தீர்வை</th>
              <th style={{ border: '1px solid #000000', padding: '5px 4px' }}>பரப்பு</th>
              <th style={{ border: '1px solid #000000', padding: '5px 4px' }}>தீர்வை</th>
            </tr>
          </thead>
          <tbody>
            {/* Dynamic Data Rows */}
            {rows.map((row) => (
              <tr key={row.sno}>
                <td style={{ border: '1px solid #000000', padding: '8px 4px' }}>{row.sno}</td>
                <td style={{ border: '1px solid #000000', padding: '8px 4px', fontWeight: 'bold' }}>
                  {row.surveyNumber}
                </td>
                <td style={{ border: '1px solid #000000', padding: '8px 4px' }}>{row.nanjaiArea}</td>
                <td style={{ border: '1px solid #000000', padding: '8px 4px' }}>{row.nanjaiAssessment}</td>
                <td style={{ border: '1px solid #000000', padding: '8px 4px' }}>{row.punjaiArea}</td>
                <td style={{ border: '1px solid #000000', padding: '8px 4px' }}>{row.punjaiAssessment}</td>
                <td style={{ border: '1px solid #000000', padding: '8px 4px' }}>{row.otherArea}</td>
                <td style={{ border: '1px solid #000000', padding: '8px 4px' }}>{row.otherAssessment}</td>
                <td style={{ border: '1px solid #000000', padding: '8px 4px', fontSize: '11px' }}>
                  {row.remarks}
                </td>
              </tr>
            ))}

            {/* ================================================== */}
            {/* 6. TOTAL ROW                                       */}
            {/* ================================================== */}
            <tr style={{ fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>
              <td colSpan={2} style={{ border: '1px solid #000000', padding: '8px', textAlign: 'right' }}>
                மொத்தம் -
              </td>
              <td style={{ border: '1px solid #000000', padding: '8px 4px' }}>{totalNanjaiArea}</td>
              <td style={{ border: '1px solid #000000', padding: '8px 4px' }}>{totalNanjaiAssessment}</td>
              <td style={{ border: '1px solid #000000', padding: '8px 4px' }}>{totalPunjaiArea}</td>
              <td style={{ border: '1px solid #000000', padding: '8px 4px' }}>{totalPunjaiAssessment}</td>
              <td style={{ border: '1px solid #000000', padding: '8px 4px' }}>{totalOtherArea}</td>
              <td style={{ border: '1px solid #000000', padding: '8px 4px' }}>{totalOtherAssessment}</td>
              <td style={{ border: '1px solid #000000', padding: '8px 4px' }}>-</td>
            </tr>
          </tbody>
        </table>

        {/* ================================================== */}
        {/* 7. DIGITAL SIGNATURE SECTION                       */}
        {/* ================================================== */}
        <div
          style={{
            border: '1px solid #000000',
            padding: '12px 15px',
            marginBottom: '20px',
            fontSize: '12px',
            backgroundColor: '#ffffff',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
            மின்னணையொப்பம் / Digital Signature :
          </div>
          <div style={{ marginLeft: '10px', lineHeight: '1.7' }}>
            <div>
              {sigDateStr} அன்று {sigTimeStr} நேரத்தில் இடப்பட்டது
            </div>
            <div>
              <strong>பெயர் / Name:</strong> {officerName}
            </div>
            <div>
              <strong>பதவி / Designation:</strong> {officerDesignation}
            </div>
            <div>
              <strong>இடம் / Place:</strong> {officerPlace}
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 8. NOTES / REMARKS BOX                              */}
        {/* ================================================== */}
        <div
          style={{
            border: '1px solid #000000',
            padding: '12px 15px',
            fontSize: '11px',
            lineHeight: '1.6',
            backgroundColor: '#ffffff',
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '13px', textDecoration: 'underline', marginBottom: '6px' }}>
            குறிப்பு
          </div>
          <ol style={{ margin: '0', paddingLeft: '20px' }}>
            <li>இச்சான்றிதழ் கணினி மூலம் பெறப்பட்டது. கையொப்பம் தேவையில்லை.</li>
            <li>
              தமிழ்நாடு அரசு நில உரிமை பதிவேடு (Patta Chitta) விதிமுறைகளின் கீழ் அதிகாரப்பூர்வமாக கணினியில் பதிவேற்றப்பட்டது.
            </li>
            <li>
              இத்தரவு வருவாய் மற்றும் பேரிடர் மேலாண்மைத் துறையின் அதிகாரப்பூர்வ கணினி அமைப்பில் சரிபார்க்கப்பட்டு சான்றளிக்கப்பட்டது.
            </li>
            <li>
              விவரங்களில் மாறுபாடு அல்லது பிழை இருந்தால் சம்பந்தப்பட்ட வருவாய் வட்டார வட்டாட்சியர் / மண்டல துணை வட்டாட்சியரை அணுகவும்.
            </li>
          </ol>
        </div>

      </div>
    </div>
  );
};

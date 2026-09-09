import React from 'react';
import ReactDOM from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LandDocument } from '../types';
import { PattaPdfTemplate } from '../components/pdf/PattaPdfTemplate';

export const generatePattaPDF = async (doc: LandDocument): Promise<void> => {
  // Create hidden offscreen container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '794px'; // 96 DPI width for A4
  container.style.backgroundColor = '#ffffff';
  document.body.appendChild(container);

  // Render PattaPdfTemplate into hidden container
  const root = ReactDOM.createRoot(container);
  root.render(<PattaPdfTemplate document={doc} />);

  // Allow fonts & styles to settle
  await new Promise((resolve) => setTimeout(resolve, 350));

  try {
    const element = (container.querySelector('#patta-pdf-document') as HTMLElement) || container;

    // Capture canvas with high resolution scale
    const canvas = await html2canvas(element, {
      scale: 2, // 2x high resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');

    // Create A4 PDF instance (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Handle multi-page continuation if document exceeds 1 page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Determine filename according to specification
    const pattaNo = (
      doc.cadastralDetails?.pattaNumber ||
      doc.extractedFields?.pattaNumber?.value ||
      '4082'
    ).replace(/patta\s*(no\.?)?/i, '').replace(/[/\\?%*:|"<>]/g, '_').trim();

    const surveyNo = (doc.surveyNumber || '124_3A').replace(/[/\\?%*:|"<>]/g, '_').trim();

    let filename = 'Generated_Patta.pdf';
    if (pattaNo && surveyNo) {
      filename = `Patta_${pattaNo}_${surveyNo}.pdf`;
    }

    // Save/Download PDF
    pdf.save(filename);
  } catch (err) {
    console.error('Failed to generate Patta PDF:', err);
    alert('An error occurred while generating the Patta PDF. Please try again.');
  } finally {
    // Cleanup container
    setTimeout(() => {
      root.unmount();
      document.body.removeChild(container);
    }, 100);
  }
};

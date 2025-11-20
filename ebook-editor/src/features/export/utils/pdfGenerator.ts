import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePDF = async (book: any, pages: any[]) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Create a temporary container to render pages
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '794px'; // A4 width in px at 96 DPI approx
  document.body.appendChild(container);

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    
    // Render page content
    const pageEl = document.createElement('div');
    pageEl.style.width = '100%';
    pageEl.style.height = '1123px'; // A4 height in px
    pageEl.style.backgroundColor = 'white';
    pageEl.style.overflow = 'hidden';
    pageEl.innerHTML = page.content;
    
    // Apply basic styles to ensure content looks right
    const style = document.createElement('style');
    style.innerHTML = `
      * { box-sizing: border-box; }
      body { margin: 0; }
      .page-content { width: 100%; height: 100%; padding: 20px; }
    `;
    pageEl.appendChild(style);
    
    container.appendChild(pageEl);

    // Convert to canvas
    const canvas = await html2canvas(pageEl, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    if (i > 0) {
      doc.addPage();
    }

    doc.addImage(imgData, 'JPEG', 0, 0, width, height);
    
    // Cleanup current page element
    container.removeChild(pageEl);
  }

  // Cleanup container
  document.body.removeChild(container);

  return doc.output('blob');
};

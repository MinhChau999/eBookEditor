import JSZip from 'jszip';
import { CONTAINER_XML, generateContentOPF, generateNCX, generateNavXHTML, CORE_CSS, PAGE_CSS } from './templates';

export const generateEPUB = async (book: any, pages: any[], mode: 'reflow' | 'fixed' = 'fixed') => {
  const zip = new JSZip();

  // 1. Mimetype (must be first, uncompressed)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2. META-INF
  zip.folder('META-INF')?.file('container.xml', CONTAINER_XML);

  // 3. OEBPS
  const oebps = zip.folder('OEBPS');
  if (!oebps) throw new Error('Failed to create OEBPS folder');

  // Content OPF
  oebps.file('content.opf', generateContentOPF(book, pages, [], mode));

  // Navigation
  oebps.file('toc.ncx', generateNCX(book, pages));
  oebps.file('nav.xhtml', generateNavXHTML(book, pages));

  // CSS
  const cssFolder = oebps.folder('css');
  cssFolder?.file('epub-core.css', CORE_CSS);
  cssFolder?.file('page-styles.css', PAGE_CSS);

  // Pages (XHTML)
  const xhtmlFolder = oebps.folder('xhtml');
  
  pages.forEach((page, i) => {
    const pageContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${page.name || `Page ${i + 1}`}</title>
  <link rel="stylesheet" type="text/css" href="../css/epub-core.css"/>
  <link rel="stylesheet" type="text/css" href="../css/page-styles.css"/>
  <style>
    ${mode === 'fixed' ? `
    html, body {
      width: ${book.pageSize?.width || 794}px;
      height: ${book.pageSize?.height || 1123}px;
      margin: 0; padding: 0;
    }
    ` : ''}
  </style>
</head>
<body>
  <div class="page-content">
    ${page.content || ''}
  </div>
</body>
</html>`;
    
    xhtmlFolder?.file(`page-${i + 1}.xhtml`, pageContent);
  });

  // Generate Blob
  const content = await zip.generateAsync({ type: 'blob' });
  return content;
};

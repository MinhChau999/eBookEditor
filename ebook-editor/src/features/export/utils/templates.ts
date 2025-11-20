export const CONTAINER_XML = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

export const generateContentOPF = (
  book: any,
  pages: any[],
  _assets: any[] = [],
  mode: 'reflow' | 'fixed' = 'fixed'
) => {
  const isFixed = mode === 'fixed';
  const pageSize = book.pageSize || { width: 794, height: 1123 }; // A4 px approx

  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${book.id || 'urn:uuid:12345'}</dc:identifier>
    <dc:title>${book.title || 'Untitled Book'}</dc:title>
    <dc:creator>${book.author || 'Unknown Author'}</dc:creator>
    <dc:language>en</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString()}</meta>
    ${isFixed ? `
    <meta property="rendition:layout">pre-paginated</meta>
    <meta property="rendition:orientation">auto</meta>
    <meta property="rendition:spread">auto</meta>
    <meta property="rendition:viewport">width=${pageSize.width}, height=${pageSize.height}</meta>
    ` : ''}
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="css-core" href="css/epub-core.css" media-type="text/css"/>
    <item id="css-page" href="css/page-styles.css" media-type="text/css"/>
    ${pages.map((_, i) => `
    <item id="page-${i + 1}" href="xhtml/page-${i + 1}.xhtml" media-type="application/xhtml+xml"/>
    `).join('')}
  </manifest>
  <spine page-progression-direction="ltr">
    ${pages.map((_, i) => `
    <itemref idref="page-${i + 1}"/>
    `).join('')}
  </spine>
</package>`;
};

export const generateNCX = (book: any, pages: any[]) => `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${book.id || 'urn:uuid:12345'}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="${pages.length}"/>
    <meta name="dtb:maxPageNumber" content="${pages.length}"/>
  </head>
  <docTitle><text>${book.title || 'Untitled Book'}</text></docTitle>
  <navMap>
    ${pages.map((page, i) => `
    <navPoint id="navPoint-${i + 1}" playOrder="${i + 1}">
      <navLabel><text>${page.name || `Page ${i + 1}`}</text></navLabel>
      <content src="xhtml/page-${i + 1}.xhtml"/>
    </navPoint>
    `).join('')}
  </navMap>
</ncx>`;

export const generateNavXHTML = (book: any, pages: any[]) => `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>${book.title || 'Untitled Book'}</title>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
      ${pages.map((page, i) => `
      <li><a href="xhtml/page-${i + 1}.xhtml">${page.name || `Page ${i + 1}`}</a></li>
      `).join('')}
    </ol>
  </nav>
</body>
</html>`;

export const CORE_CSS = `
body { margin: 0; padding: 0; }
`;

export const PAGE_CSS = `
.page-content { width: 100%; height: 100%; overflow: hidden; position: relative; }
`;

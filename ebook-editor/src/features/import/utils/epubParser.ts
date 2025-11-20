import JSZip from 'jszip';

export interface ParsedBook {
  title: string;
  author: string;
  pages: {
    name: string;
    content: string;
    styles?: string;
  }[];
}

export const parseEPUB = async (file: File): Promise<ParsedBook> => {
  const zip = await JSZip.loadAsync(file);
  const parser = new DOMParser();

  // 1. Find OPF file from container.xml
  const containerXml = await zip.file('META-INF/container.xml')?.async('text');
  if (!containerXml) throw new Error('Invalid EPUB: Missing container.xml');

  const containerDoc = parser.parseFromString(containerXml, 'text/xml');
  const rootfile = containerDoc.querySelector('rootfile');
  const opfPath = rootfile?.getAttribute('full-path');
  if (!opfPath) throw new Error('Invalid EPUB: Missing rootfile path');

  // 2. Parse OPF
  const opfContent = await zip.file(opfPath)?.async('text');
  if (!opfContent) throw new Error(`Invalid EPUB: Missing OPF file at ${opfPath}`);

  const opfDoc = parser.parseFromString(opfContent, 'text/xml');
  
  // Metadata
  const title = opfDoc.querySelector('title')?.textContent || 'Untitled';
  const author = opfDoc.querySelector('creator')?.textContent || 'Unknown';

  // Manifest & Spine
  const manifestItems = Array.from(opfDoc.querySelectorAll('manifest > item'));
  const spineItems = Array.from(opfDoc.querySelectorAll('spine > itemref'));

  const opfDir = opfPath.split('/').slice(0, -1).join('/');
  const resolvePath = (href: string) => opfDir ? `${opfDir}/${href}` : href;

  // 3. Extract Assets (Images)
  const assets: Record<string, string> = {};
  const imageItems = manifestItems.filter(item => item.getAttribute('media-type')?.startsWith('image/'));
  
  for (const item of imageItems) {
    const href = item.getAttribute('href');
    if (href) {
      const fullPath = resolvePath(href);
      const blob = await zip.file(fullPath)?.async('blob');
      if (blob) {
        const url = URL.createObjectURL(blob);
        assets[href] = url;
        // Also handle relative paths if needed, but for now map by href
      }
    }
  }

  // 4. Extract CSS
  let globalStyles = '';
  const cssItems = manifestItems.filter(item => item.getAttribute('media-type') === 'text/css');
  for (const item of cssItems) {
    const href = item.getAttribute('href');
    if (href) {
      const fullPath = resolvePath(href);
      const css = await zip.file(fullPath)?.async('text');
      if (css) {
        globalStyles += css + '\n';
      }
    }
  }

  // 5. Extract Pages
  const pages = [];
  for (const itemRef of spineItems) {
    const idref = itemRef.getAttribute('idref');
    const item = manifestItems.find(i => i.getAttribute('id') === idref);
    if (item) {
      const href = item.getAttribute('href');
      if (href) {
        const fullPath = resolvePath(href);
        const content = await zip.file(fullPath)?.async('text');
        if (content) {
          // Extract body content
          const doc = parser.parseFromString(content, 'text/html');
          
          // Replace image sources
          const images = Array.from(doc.querySelectorAll('img'));
          for (const img of images) {
            const src = img.getAttribute('src');
            if (src) {
              // Simple resolution: check if asset exists
              // In real EPUBs, src is relative to the XHTML file.
              // We need to resolve it against the XHTML path.
              // For simplicity, we'll try to find the asset by filename or partial match if exact match fails.
              // Or better: resolve path.
              
              // Resolve relative path logic
              // This is complex without a full path resolver.
              // Let's try to match by filename for now as a fallback.
              const filename = src.split('/').pop();
              const matchingAsset = Object.keys(assets).find(k => k.endsWith(filename || ''));
              
              if (matchingAsset) {
                img.setAttribute('src', assets[matchingAsset]);
              }
            }
          }

          const body = doc.body.innerHTML;
          pages.push({
            name: doc.title || `Page ${pages.length + 1}`,
            content: body,
            styles: globalStyles // Apply global styles to each page for now
          });
        }
      }
    }
  }

  return { title, author, pages };
};

/**
 * Export a DOM element as a PDF file.
 * 
 * Strategy: Clone the target element into a temporary visible container,
 * let html2canvas capture the clone at exact A4-landscape pixel dimensions,
 * then remove the clone. The capture width matches the jsPDF page width
 * so content is perfectly centered with no cut-off.
 */
export const downloadPdf = async (elementId, filename = 'document.pdf') => {
  console.log('[PDF Export] Step 1: Starting export for element:', elementId);

  // Load html2pdf dynamically if not available
  if (!window.html2pdf) {
    console.log('[PDF Export] Step 2: Loading html2pdf library...');
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => { console.log('[PDF Export] html2pdf loaded'); resolve(); };
      script.onerror = (e) => { console.error('[PDF Export] Failed to load:', e); reject(e); };
      document.head.appendChild(script);
    });
  }

  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    console.error('[PDF Export] ERROR: Element not found:', elementId);
    alert('Gagal membuat PDF: elemen template tidak ditemukan.');
    return;
  }

  const textContent = sourceElement.textContent?.trim() || '';
  console.log('[PDF Export] Step 3: Element found. Content length:', textContent.length);

  // ── CLONE INTO VISIBLE STAGING AREA ──
  console.log('[PDF Export] Step 4: Cloning element...');

  const clone = sourceElement.cloneNode(true);
  clone.removeAttribute('id');

  // A4 Landscape at 96 DPI: 297mm × 210mm ≈ 1122px × 794px
  // We use the full page width so html2pdf maps 1:1 to the PDF page.
  // The 20mm margin on each side = ~76px, so content area = ~1046px.
  const PAGE_WIDTH_PX = 1050;

  const stagingContainer = document.createElement('div');
  stagingContainer.setAttribute('style', [
    'position: fixed',
    'top: 0',
    'left: 0',
    `width: ${PAGE_WIDTH_PX}px`,
    'z-index: -9999',
    'opacity: 1',
    'pointer-events: none',
    'background: white',
    'box-sizing: border-box',
    'font-family: system-ui, -apple-system, sans-serif',
  ].join('; '));
  stagingContainer.appendChild(clone);
  document.body.appendChild(stagingContainer);

  // Wait for browser to paint
  await new Promise(r => setTimeout(r, 350));
  console.log('[PDF Export] Step 5: Starting html2canvas capture...');

  const opt = {
    margin:       [10, 15, 10, 15],  // top, left, bottom, right (mm) — symmetric LR
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { 
      scale: 2,
      useCORS: true, 
      logging: false,
      width: PAGE_WIDTH_PX,
      windowWidth: PAGE_WIDTH_PX,
      scrollX: 0,
      scrollY: 0,
      backgroundColor: '#ffffff',
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'landscape'
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  try {
    await window.html2pdf().set(opt).from(clone).save();
    console.log('[PDF Export] Step 6: PDF saved as:', filename);
  } catch (error) {
    console.error('[PDF Export] ERROR:', error);
    alert('Gagal membuat PDF. Silakan coba lagi.');
  } finally {
    document.body.removeChild(stagingContainer);
    console.log('[PDF Export] Step 7: Cleanup done.');
  }
};

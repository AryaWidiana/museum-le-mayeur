/**
 * Export a DOM element as a perfectly centered PDF.
 *
 * ── KEY INSIGHT ──
 * html2pdf's `margin` option CROPS the canvas, it doesn't ADD whitespace.
 * This causes left-side clipping when widths don't match perfectly.
 *
 * SOLUTION: Set html2pdf margin to ZERO. All whitespace/padding is baked
 * into the HTML template itself (via inline CSS padding). The template
 * width matches A4 landscape at 96 DPI (1122px), so the canvas maps
 * 1:1 onto the PDF page with no scaling artifacts.
 */

// A4 Landscape dimensions at 96 DPI
const A4_LANDSCAPE_WIDTH_PX = 1122;  // 297mm × 3.78px/mm

export const downloadPdf = async (elementId, filename = 'document.pdf') => {
  console.log('[PDF] 1/7 Starting:', elementId);

  // Load html2pdf
  if (!window.html2pdf) {
    console.log('[PDF] 2/7 Loading html2pdf library...');
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => { console.log('[PDF] html2pdf ready'); resolve(); };
      script.onerror = (e) => { console.error('[PDF] Load failed:', e); reject(e); };
      document.head.appendChild(script);
    });
  }

  const source = document.getElementById(elementId);
  if (!source) {
    console.error('[PDF] Element not found:', elementId);
    alert('Gagal: elemen PDF tidak ditemukan.');
    return;
  }

  console.log('[PDF] 3/7 Found element, content chars:', source.textContent?.trim().length);

  // Clone into a staging container at the exact A4 landscape pixel width
  const clone = source.cloneNode(true);
  clone.removeAttribute('id');

  const stage = document.createElement('div');
  stage.setAttribute('style', [
    'position: fixed',
    'top: 0',
    'left: 0',
    `width: ${A4_LANDSCAPE_WIDTH_PX}px`,
    'z-index: -9999',
    'opacity: 1',
    'pointer-events: none',
    'background: #fff',
  ].join(';'));
  stage.appendChild(clone);
  document.body.appendChild(stage);

  console.log('[PDF] 4/7 Clone staged at', A4_LANDSCAPE_WIDTH_PX, 'px');
  await new Promise(r => setTimeout(r, 400));

  console.log('[PDF] 5/7 Capturing with html2canvas...');

  try {
    await window.html2pdf().set({
      // ── ZERO MARGINS ── padding is in the HTML template
      margin:    0,
      filename:  filename,
      image:     { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale:           2,
        useCORS:         true,
        logging:         false,
        width:           A4_LANDSCAPE_WIDTH_PX,
        windowWidth:     A4_LANDSCAPE_WIDTH_PX,
        scrollX:         0,
        scrollY:         0,
        x:               0,
        y:               0,
        backgroundColor: '#ffffff',
      },
      jsPDF: {
        unit:        'mm',
        format:      'a4',
        orientation: 'landscape',
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    }).from(clone).save();

    console.log('[PDF] 6/7 Saved:', filename);
  } catch (err) {
    console.error('[PDF] Generation failed:', err);
    alert('Gagal membuat PDF. Coba lagi.');
  } finally {
    document.body.removeChild(stage);
    console.log('[PDF] 7/7 Cleanup done');
  }
};

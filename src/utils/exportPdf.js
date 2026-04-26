/**
 * Export a DOM element as a PDF file.
 * 
 * Strategy: Clone the target element into a temporary visible container,
 * let html2canvas capture the clone, then remove it. This avoids all
 * issues with off-screen positioning, opacity, and parent style conflicts.
 */
export const downloadPdf = async (elementId, filename = 'document.pdf') => {
  console.log('[PDF Export] Step 1: Starting export for element:', elementId);

  // Load html2pdf dynamically if not available
  if (!window.html2pdf) {
    console.log('[PDF Export] Step 2: Loading html2pdf library...');
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => { console.log('[PDF Export] html2pdf loaded successfully'); resolve(); };
      script.onerror = (e) => { console.error('[PDF Export] Failed to load html2pdf:', e); reject(e); };
      document.head.appendChild(script);
    });
  }

  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    console.error('[PDF Export] ERROR: Element not found with id:', elementId);
    alert('Gagal membuat PDF: elemen template tidak ditemukan.');
    return;
  }

  // Check if the source element has any real content
  const textContent = sourceElement.textContent?.trim() || '';
  console.log('[PDF Export] Step 3: Source element found. Text length:', textContent.length, 'chars');
  if (textContent.length < 10) {
    console.warn('[PDF Export] WARNING: Element appears to have very little content');
  }

  // ── CLONE STRATEGY ──
  // Clone the element into a visible staging container so html2canvas
  // can capture it properly. The clone is positioned behind everything
  // (z-index: -9999) but fully visible (opacity: 1) for the canvas renderer.
  console.log('[PDF Export] Step 4: Cloning element for capture...');

  const clone = sourceElement.cloneNode(true);
  clone.removeAttribute('id'); // Prevent duplicate ID warnings

  const stagingContainer = document.createElement('div');
  stagingContainer.setAttribute('style', [
    'position: fixed',
    'top: 0',
    'left: 0',
    'width: 980px',
    'z-index: -9999',       // Behind everything — user can't see it
    'opacity: 1',           // BUT fully opaque for html2canvas
    'pointer-events: none',
    'background: white',
  ].join('; '));
  stagingContainer.appendChild(clone);
  document.body.appendChild(stagingContainer);

  // Wait for the browser to paint the cloned content
  await new Promise(r => setTimeout(r, 300));

  console.log('[PDF Export] Step 5: Clone rendered. Starting html2canvas capture...');

  const opt = {
    margin:       [10, 10, 10, 10],
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { 
      scale: 2, 
      useCORS: true, 
      logging: false,
      width: 980,
      windowWidth: 1000,
      scrollX: 0,
      scrollY: 0,
      backgroundColor: '#ffffff'
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    // Break pages cleanly on these selectors
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  try {
    await window.html2pdf().set(opt).from(clone).save();
    console.log('[PDF Export] Step 6: PDF saved successfully as:', filename);
  } catch (error) {
    console.error('[PDF Export] ERROR during PDF generation:', error);
    alert('Gagal membuat PDF. Silakan coba lagi.');
  } finally {
    // Always clean up the staging container
    document.body.removeChild(stagingContainer);
    console.log('[PDF Export] Step 7: Cleanup complete.');
  }
};

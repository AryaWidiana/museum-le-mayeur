export const downloadPdf = async (elementId, filename = 'document.pdf') => {
  // Load html2pdf dynamically if not available
  if (!window.html2pdf) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element for PDF not found:', elementId);
    return;
  }

  // ── FIX: Temporarily move the element on-screen so html2canvas can capture it ──
  const wrapper = element.closest('[style]') || element.parentElement;
  const originalStyle = wrapper?.getAttribute('style') || '';
  if (wrapper) {
    wrapper.setAttribute('style', 'position:fixed; top:0; left:0; z-index:-1; opacity:0; pointer-events:none;');
  }

  // Wait a tick for the browser to repaint with the element visible
  await new Promise(r => setTimeout(r, 100));

  const opt = {
    margin:       [15, 15, 15, 15],
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { 
      scale: 2, 
      useCORS: true, 
      logging: false,
      windowWidth: 1000,
      // Force canvas to capture the full element
      scrollX: 0,
      scrollY: 0 
    },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  try {
    await window.html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('Error generating PDF:', error);
  } finally {
    // Restore original position
    if (wrapper) {
      wrapper.setAttribute('style', originalStyle);
    }
  }
};

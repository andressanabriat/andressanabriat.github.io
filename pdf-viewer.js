/**
 * Résumé (CV) dialog: PDF viewer built on PDF.js 4.10.38 (CDN import).
 *
 * Renders `Curriculum_Andres_S.pdf` into one canvas per page inside the
 * dialog preview. Toolbar actions (data-cv-action) cover zoom in/out,
 * fit page, rotate left, print (via a temporary iframe) and opening
 * Google Drive; Ctrl + wheel also zooms, but only over the preview.
 *
 * Scale model: the internal `scaleFactor` runs 0.4–4 where 1 equals
 * "fit page". The displayed percentage remaps that range onto an
 * apparent 10–250% (so the number shown always grows with zoom);
 * the dialog always reopens at 2.14, displayed as 157%. Each render
 * bumps `renderVersion` and cancels superseded render tasks.
 */
import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs';

const pdfUrl = 'Curriculum_Andres_S.pdf';
const pdfDialog = document.querySelector('#cv-dialog');
const preview = pdfDialog.querySelector('.cv-preview');
const pagesContainer = pdfDialog.querySelector('.cv-pages');
const zoomLevel = pdfDialog.querySelector('.cv-zoom-level');
const toolButtons = [...pdfDialog.querySelectorAll('[data-cv-action]')];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';

let pdfDocument;
let pdfData;
let scaleFactor = 2.14; // 1 = fit page; 2.14 ≈ "157%" is the fixed opening zoom.
let rotation = 0;
let renderVersion = 0;
let renderTasks = [];

/**
 * Fetches and caches the PDF once, resets the zoom to the opening
 * level, then renders all pages.
 */
async function loadDocument() {
  if (pdfDocument) return pdfDocument;
  pagesContainer.innerHTML = '<p class="cv-loading">Cargando documento…</p>';
  pdfDocument = await pdfjsLib.getDocument(pdfUrl).promise;
  pdfData = await pdfDocument.getData();
  scaleFactor = 2.14;
  updateZoomLevel();
  await renderPages();
  return pdfDocument;
}

/**
 * Fit-to-page scale for a unit viewport, based on the current
 * preview box (minus its padding). Keeps ~34px breathing room.
 */
function pageScale(viewportAtOne) {
  const availableWidth = Math.max(120, preview.clientWidth - 34);
  const availableHeight = Math.max(120, preview.clientHeight - 34);
  return Math.min(availableWidth / viewportAtOne.width, availableHeight / viewportAtOne.height);
}

/**
 * Maps the internal range 0.4–4 onto the displayed 10–250% so zooming
 * always reads as "bigger number", and keeps the ARIA label bilingual.
 */
function updateZoomLevel() {
  const displayedPercent = scaleFactor <= 1
    ? 10 + ((scaleFactor - 0.4) / 0.6) * 90
    : 100 + ((scaleFactor - 1) / 3) * 150;
  const percentage = Math.round(displayedPercent);
  zoomLevel.textContent = `${percentage}%`;
  zoomLevel.setAttribute('aria-label', document.documentElement.lang === 'en' ? `Zoom ${percentage}%` : `Zoom actual ${percentage}%`);
}

/**
 * Multiplies the scale (clamped 0.4–4) and re-renders.
 */
function changeZoom(factor) {
  scaleFactor = Math.min(4, Math.max(0.4, scaleFactor * factor));
  updateZoomLevel();
  return renderPages();
}

/**
 * Renders every page at the current scale/rotation into a canvas with
 * device-pixel-ratio backing. A version counter plus task cancellation
 * guarantees only the newest render survives rapid zoom changes;
 * cancelled renders never throw to showError.
 */
async function renderPages() {
  if (!pdfDocument) return;
  const version = ++renderVersion;
  renderTasks.forEach((task) => task.cancel());
  renderTasks = [];
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
    const page = await pdfDocument.getPage(pageNumber);
    const pageRotation = (page.rotate + rotation + 360) % 360;
    const unitViewport = page.getViewport({ scale: 1, rotation: pageRotation });
    const viewportScale = pageScale(unitViewport) * scaleFactor;
    const viewport = page.getViewport({ scale: viewportScale, rotation: pageRotation });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: false });
    const outputScale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.className = 'cv-page';
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', document.documentElement.lang === 'en'
      ? `Page ${pageNumber} of ${pdfDocument.numPages}`
      : `Página ${pageNumber} de ${pdfDocument.numPages}`);
    const task = page.render({
      canvasContext: context,
      viewport,
      transform: outputScale === 1 ? null : [outputScale, 0, 0, outputScale, 0, 0]
    });
    renderTasks.push(task);
    pages.push({ canvas, task });
  }

  pagesContainer.replaceChildren(...pages.map(({ canvas }) => canvas));
  await Promise.all(pages.map(({ task }) => task.promise.catch((error) => {
    if (error.name !== 'RenderingCancelledException') throw error;
  })));
  if (version !== renderVersion) return;
}

function showError(error) {
  console.error('No se pudo cargar el CV:', error);
  pagesContainer.innerHTML = '<p class="cv-loading">No se pudo cargar el PDF. Puedes descargarlo con el botón inferior.</p>';
}

// Engine: cancel pending renders when the dialog closes so nothing
// renders off-screen.
pdfDialog.addEventListener('close', () => {
  renderTasks.forEach((task) => task.cancel());
});

// Ctrl + wheel zooms the preview from inside; plain scroll must keep
// scrolling pages normally (hence the early return without ctrlKey).
preview.addEventListener('wheel', (event) => {
  if (!event.ctrlKey) return;
  event.preventDefault();
  event.stopPropagation();
  changeZoom(event.deltaY < 0 ? 1.1 : 1 / 1.1).catch(showError);
}, { passive: false });

// Every opening resets the zoom to the fixed 157% level, whether the
// document is already cached (re-render) or still loading (loadDocument).
document.querySelector('.cv-open').addEventListener('click', () => {
  scaleFactor = 2.14;
  updateZoomLevel();
  const opening = pdfDocument ? renderPages() : loadDocument();
  opening.catch(showError);
});

document.addEventListener('portfolio-language-change', (event) => {
  const language = event.detail.language;
  pagesContainer.querySelectorAll('.cv-page').forEach((page, index) => {
    page.setAttribute('aria-label', language === 'en'
      ? `Page ${index + 1} of ${pdfDocument.numPages}`
      : `Página ${index + 1} de ${pdfDocument.numPages}`);
  });
  updateZoomLevel();
});

// Toolbar: Drive opens externally (no upload integration, by design);
// print streams the cached bytes through a temporary iframe, starting
// the print dialog once loaded and cleaning up after `afterprint` or a
// 60s safety timeout; other actions adjust scale/rotation and re-render.
toolButtons.forEach((button) => button.addEventListener('click', async () => {
  const action = button.dataset.cvAction;
  if (action === 'drive') {
    window.open('https://drive.google.com/drive/my-drive', '_blank', 'noopener,noreferrer');
    return;
  }

  try {
    await loadDocument();
    if (action === 'zoom-in') scaleFactor = Math.min(scaleFactor * 1.15, 4);
    if (action === 'zoom-out') scaleFactor = Math.max(scaleFactor / 1.15, 0.4);
    if (action === 'fit') scaleFactor = 1;
    if (action === 'rotate') rotation = (rotation + 270) % 360;
    if (action === 'print') {
      const printableUrl = URL.createObjectURL(new Blob([pdfData], { type: 'application/pdf' }));
      const printFrame = document.createElement('iframe');
      printFrame.className = 'cv-print-frame';
      printFrame.src = printableUrl;
      printFrame.onload = () => {
        let cleanedUp = false;
        const cleanup = () => {
          if (cleanedUp) return;
          cleanedUp = true;
          URL.revokeObjectURL(printableUrl);
          printFrame.remove();
        };
        printFrame.contentWindow.addEventListener('afterprint', cleanup, { once: true });
        window.setTimeout(cleanup, 60000);
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
      };
      document.body.append(printFrame);
      return;
    }
    updateZoomLevel();
    await renderPages();
  } catch (error) {
    showError(error);
  }
}));

// Re-render (debounced) when the preview area resizes, so the fit
// recalculates with the dialog size already settled.
let resizeTimeout;
function handlePreviewResize() {
  if (!pdfDocument || !pdfDialog.open) return;
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => renderPages().catch(showError), 100);
}

if ('ResizeObserver' in window) new ResizeObserver(handlePreviewResize).observe(preview);
else window.addEventListener('resize', handlePreviewResize);

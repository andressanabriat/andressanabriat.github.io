/**
 * Portfolio interaction layer.
 *
 * Owns all front-end behavior, top to bottom:
 *   1. Bilingual ES/EN translations driven by data-i18n attributes.
 *   2. Mobile menu and ES/EN language selector.
 *   3. "Back to top" floating button.
 *   4. The draggable, auto-scrolling "tech belt" marquee.
 *   5. The shared project dialog with its screenshot carousel.
 *   6. The résumé (CV) dialog.
 *   7. Sync with the 3D hero scene when a node is selected.
 *
 * No build step and no framework: plain ES, kept simple on purpose.
 */

const menuToggle = document.querySelector('.menu-toggle');
const menuPanel = document.querySelector('.menu-panel');
const languageButtons = document.querySelectorAll('.language-button');
let selectedSceneNode = 0;
// Labels shown under the 3D hero for each selectable node, per language.
const sceneText = {
  es: [
    ['Código', 'La lógica que da forma a una idea.'],
    ['Producto', 'Una experiencia digital pensada para las personas.'],
    ['Emprendimiento', 'Convertir una oportunidad en algo que aporte valor.']
  ],
  en: [
    ['Code', 'The logic that gives an idea its shape.'],
    ['Product', 'A digital experience designed around people.'],
    ['Entrepreneurship', 'Turning an opportunity into something valuable.']
  ]
};

// UI strings for both languages. data-i18n keys map to elements in index.html.
const translations = {
  es: {
    'nav.about': 'Yo', 'nav.projects': 'Proyectos', 'nav.services': 'Lo que hago', 'nav.contact': 'Contacto', 'nav.backToTop': 'Volver arriba', 'nav.mainLabel': 'Navegación principal', 'nav.languageSelector': 'Selector de idioma', 'nav.openMenu': 'Abrir menú', 'nav.closeMenu': 'Cerrar menú',
    'brand.homeLabel': 'AS — Andrés Sanabria, inicio',
    'hero.eyebrow': 'Hola, soy Andrés <span class="wave">✦</span>',
    'hero.title': 'Código, ideas e <em>Innovación</em>',
    'hero.description': 'Exploro ideas y construyo experiencias digitales combinando tecnología, propósito y creatividad.',
    'hero.projects': 'Ver proyectos', 'hero.contact': 'Hablemos', 'hero.cardLine1': 'ideas', 'hero.cardLine2': 'en movimiento',
    'scene.idea': 'IDEA', 'scene.fallbackCode': 'CÓDIGO', 'scene.fallbackProduct': 'PRODUCTO', 'scene.fallbackVenture': 'EMPRENDER',
    'about.label': '01 / Yo', 'about.title': 'Me gusta convertir<br><span>ideas en realidad</span>',
    'about.text': '<p>Soy Técnico Superior en Desarrollo de Aplicaciones Multiplataforma y desarrollador junior. Me interesa crear soluciones digitales que no solo funcionen, sino que resuelvan problemas reales y aporten valor.</p><p>Me gusta explorar nuevas formas de desarrollar software, especialmente trabajando con agentes de inteligencia artificial como apoyo para investigar, programar, probar ideas y acelerar el desarrollo. Creo que aprender a trabajar con estas herramientas es una parte importante de la evolución de los desarrolladores.</p><p>También me apasiona el emprendimiento, detectar oportunidades, convertir ideas en proyectos y aprender durante el proceso. Disfruto combinando tecnología, creatividad y curiosidad para seguir creciendo y construir cosas propias.</p>',
    'projects.label': '02 / Proyectos', 'projects.title': 'Trabajo <span>seleccionado</span>', 'projects.placeholderTitle': 'Proyecto en preparación', 'projects.placeholderText': 'Próximamente · Caso de estudio', 'projects.placeholderStatus': 'Contenido pendiente',
    'project.openLabel1': 'Abrir información del proyecto 01', 'project.openLabel2': 'Abrir información del proyecto 02', 'project.openLabel3': 'Abrir información del proyecto 03', 'project.closeLabel': 'Cerrar ventana', 'project.carouselLabel': 'Capturas del proyecto',
    'project.previousLabel': 'Captura anterior', 'project.nextLabel': 'Captura siguiente', 'project.goToScreenshot1': 'Ir a la captura 1', 'project.goToScreenshot2': 'Ir a la captura 2', 'project.goToScreenshot3': 'Ir a la captura 3',
    'project.descriptionTitle': 'Descripción del proyecto', 'project.descriptionPlaceholder': 'Aquí irá la descripción del proyecto.',
    'projectOne.description': 'Dynamic Users es una aplicación móvil desarrollada con Dart para usuarios de gimnasios. Permite consultar las rutinas asignadas por su entrenador o crear rutinas propias, hacer seguimiento de su estado físico y consultar cómo realizar ejercicios organizados por grupos musculares. Forma parte del ecosistema Dynamic Centros Deportivos, el sistema de gestión para centros deportivos que presento en el siguiente proyecto.',
    'projectTwo.description': 'Dynamic Centros Deportivos es una aplicación web desarrollada con React para la gestión de gimnasios. Permite centralizar en una sola plataforma la administración del centro, sus usuarios, rutinas y pagos, ayudando a los administradores a gestionar mejor su centro deportivo. Forma parte del ecosistema Dynamic Users, la aplicación móvil para los usuarios de los centros deportivos.',
    'projectThree.description': 'HelpDesk diseñado para la Clínica Sagrada Familia. Permite reportar incidencias mediante tickets dirigidos al administrador y hacer seguimiento de cada una. El proyecto se presentó a un concurso para ser elegido como sistema de soporte de la clínica, pero no fue seleccionado; por ello, quedó como prototipo y no llegó a conectarse a una base de datos.',
    'project.technologiesTitle': 'Lenguajes y tecnologías', 'project.technologiesPlaceholder': 'Aquí irán los iconos de los lenguajes', 'project.coverAlt': 'Portada de Dynamic Health, Sport & Motivation en versión móvil', 'project.loginAlt': 'Pantalla de bienvenida de Dynamic App en móvil',
    'projectOne.title': 'Dynamic Users', 'projectOne.subtitle': 'Entrenamientos, estado físico y ejercicios.', 'projectTwo.title': 'Dynamic Centros Deportivos', 'projectTwo.subtitle': 'Gestión de usuarios, rutinas y pagos.', 'projectThree.title': 'HelpDesk Clínica Sagrada Familia', 'projectThree.subtitle': 'Tickets, incidencias y soluciones.',
    'services.label': '03 / Lo que hago', 'services.devTitle': 'Desarrollo de software', 'services.devText': 'Aplicaciones y soluciones construidas desde una base sólida.', 'services.designTitle': 'Diseño de interfaces', 'services.designText': 'Experiencias digitales claras, accesibles y fáciles de usar.', 'services.productTitle': 'Productos digitales', 'services.productText': 'Ideas transformadas en propuestas útiles y coherentes.',
    'services.techTitle': 'Lenguajes, frameworks<br><span>& tecnologías</span>', 'services.techBeltLabel': 'Lenguajes y tecnologías que manejo',
    'contact.label': '04 / Contacto', 'contact.title': '¿Tienes una idea?<br><em>Hablemos</em>', 'contact.linkedin': 'LinkedIn', 'contact.github': 'GitHub', 'contact.githubPending': 'Enlace pendiente', 'contact.cv': 'CV', 'contact.cvPending': 'Próximamente',
    'cv.openLabel': 'Abrir CV (currículum)', 'cv.title': 'Curriculum Vitae', 'cv.previewTitle': 'Vista previa del currículum', 'cv.download': 'Descargar CV',
    'cv.toolbarLabel': 'Herramientas del documento', 'cv.zoomControlsLabel': 'Controles de zoom', 'cv.zoomOut': 'Alejar', 'cv.zoomIn': 'Acercar', 'cv.fitPage': 'Ajustar página', 'cv.rotateLeft': 'Girar a la izquierda', 'cv.drive': 'Abrir Google Drive para subir el CV', 'cv.print': 'Imprimir', 'contact.emailLabel': 'Redactar correo a andresesanabria9@gmail.com en Gmail'
  },
  en: {
    'nav.about': 'About me', 'nav.projects': 'Projects', 'nav.services': 'What I do', 'nav.contact': 'Contact', 'nav.backToTop': 'Back to top', 'nav.mainLabel': 'Main navigation', 'nav.languageSelector': 'Language selector', 'nav.openMenu': 'Open menu', 'nav.closeMenu': 'Close menu',
    'brand.homeLabel': 'AS — Andrés Sanabria, home',
    'hero.eyebrow': 'Hi, I’m Andrés <span class="wave">✦</span>',
    'hero.title': 'Code, ideas and <em>innovation</em>',
    'hero.description': 'I explore ideas and build digital experiences by combining technology, purpose and creativity.',
    'hero.projects': 'View projects', 'hero.contact': 'Let’s talk', 'hero.cardLine1': 'ideas', 'hero.cardLine2': 'in motion',
    'scene.idea': 'IDEA', 'scene.fallbackCode': 'CODE', 'scene.fallbackProduct': 'PRODUCT', 'scene.fallbackVenture': 'BUILD',
    'about.label': '01 / About me', 'about.title': 'I like turning<br><span>ideas into reality</span>',
    'about.text': '<p>I am a Higher Technician in Multiplatform Application Development and a junior developer. I am interested in creating digital solutions that not only work, but also solve real problems and deliver value.</p><p>I enjoy exploring new ways to develop software, especially using AI agents to support research, coding, testing ideas and speeding up development. I believe learning to work with these tools is an important part of how developers evolve.</p><p>I am also passionate about entrepreneurship: spotting opportunities, turning ideas into projects and learning along the way. I enjoy combining technology, creativity and curiosity to keep growing and build things of my own.</p>',
    'projects.label': '02 / Projects', 'projects.title': '<span>Selected</span> work', 'projects.placeholderTitle': 'Project in progress', 'projects.placeholderText': 'Coming soon · Case study', 'projects.placeholderStatus': 'Content pending',
    'project.openLabel1': 'Open project 01 details', 'project.openLabel2': 'Open project 02 details', 'project.openLabel3': 'Open project 03 details', 'project.closeLabel': 'Close window', 'project.carouselLabel': 'Project screenshots',
    'project.previousLabel': 'Previous screenshot', 'project.nextLabel': 'Next screenshot', 'project.goToScreenshot1': 'Go to screenshot 1', 'project.goToScreenshot2': 'Go to screenshot 2', 'project.goToScreenshot3': 'Go to screenshot 3',
    'project.descriptionTitle': 'Project description', 'project.descriptionPlaceholder': 'Project description goes here.',
    'projectOne.description': 'Dynamic Users is a mobile application developed with Dart for gym members. It lets users view routines assigned by their trainer or create their own, track their physical condition, and learn how to perform exercises organized by muscle group. It is part of the Dynamic Centros Deportivos ecosystem, the sports-center management system featured in the next project.',
    'projectTwo.description': 'Dynamic Centros Deportivos is a web application developed with React for gym management. It centralizes the administration of the center, its users, routines, and payments in one platform, helping administrators manage their sports center more effectively. It is part of the Dynamic Users ecosystem, the mobile app for sports-center members.',
    'projectThree.description': 'HelpDesk designed for Clínica Sagrada Familia. It lets users report issues through tickets sent to the administrator and track each issue. The project was submitted to a competition to be selected as the clinic’s support system, but it was not selected; therefore, it remained a prototype and was never connected to a database.',
    'project.technologiesTitle': 'Languages and technologies', 'project.technologiesPlaceholder': 'Language icons go here', 'project.coverAlt': 'Cover image for Dynamic Health, Sport & Motivation mobile app', 'project.loginAlt': 'Dynamic App mobile welcome screen',
    'projectOne.title': 'Dynamic Users', 'projectOne.subtitle': 'Training, fitness and exercises.', 'projectTwo.title': 'Dynamic Centros Deportivos', 'projectTwo.subtitle': 'User, routine and payment management.', 'projectThree.title': 'HelpDesk Clínica Sagrada Familia', 'projectThree.subtitle': 'Tickets, issues and solutions.',
    'services.label': '03 / What I do', 'services.devTitle': 'Software development', 'services.devText': 'Applications and solutions built on a solid foundation.', 'services.designTitle': 'Interface design', 'services.designText': 'Clear, accessible and easy-to-use digital experiences.', 'services.productTitle': 'Digital products', 'services.productText': 'Ideas shaped into useful and coherent proposals.',
    'services.techTitle': 'Languages, frameworks<br><span>& technologies</span>', 'services.techBeltLabel': 'Languages and technologies I use',
    'contact.label': '04 / Contact', 'contact.title': 'Have an idea?<br><em>Let’s talk</em>', 'contact.linkedin': 'LinkedIn', 'contact.github': 'GitHub', 'contact.githubPending': 'Link pending', 'contact.cv': 'CV', 'contact.cvPending': 'Coming soon',
    'cv.openLabel': 'Open CV (résumé)', 'cv.title': 'Curriculum Vitae', 'cv.previewTitle': 'Résumé preview', 'cv.download': 'Download résumé',
    'cv.toolbarLabel': 'Document tools', 'cv.zoomControlsLabel': 'Zoom controls', 'cv.zoomOut': 'Zoom out', 'cv.zoomIn': 'Zoom in', 'cv.fitPage': 'Fit page', 'cv.rotateLeft': 'Rotate left', 'cv.drive': 'Open Google Drive to upload résumé', 'cv.print': 'Print', 'contact.emailLabel': 'Compose email to andresesanabria9@gmail.com in Gmail'
  }
};

/**
 * Re-renders every translatable element in the requested language.
 *
 * Covers visible text (data-i18n) and accessibility-facing attributes
 * (data-i18n-aria / -alt / -title), updates <html lang> and the active
 * ES/EN button, refreshes the 3D scene labels, and persists the choice.
 * Falls back to Spanish on unknown values. Validation of controlled storage
 * is intentional: a blocked localStorage must never break the page.
 */
function setLanguage(language) {
  if (!translations[language]) language = 'es';
  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const translation = translations[language][element.dataset.i18n];
    if (translation) element.innerHTML = translation;
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
    const translation = translations[language][element.dataset.i18nAria];
    if (translation) element.setAttribute('aria-label', translation);
  });
  document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
    const translation = translations[language][element.dataset.i18nAlt];
    if (translation) element.setAttribute('alt', translation);
  });
  document.querySelectorAll('[data-i18n-title]').forEach((element) => {
    const translation = translations[language][element.dataset.i18nTitle];
    if (translation) element.setAttribute('title', translation);
  });
  languageButtons.forEach((button) => {
    const isActive = button.dataset.language === language;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', isActive);
  });
  menuToggle.setAttribute('aria-label', translations[language][menuPanel.classList.contains('open') ? 'nav.closeMenu' : 'nav.openMenu']);
  const [sceneTitle, sceneDescription] = sceneText[language][selectedSceneNode];
  document.querySelector('.scene-title').textContent = sceneTitle;
  document.querySelector('.scene-description').textContent = sceneDescription;
  try {
    localStorage.setItem('portfolio-language', language);
  } catch (error) {
    // Keep the selected language for this page when browser storage is disabled.
  }
  document.dispatchEvent(new CustomEvent('portfolio-language-change', { detail: { language } }));
}

// ── Navigation: mobile menu and language selector ─────────────────────────

menuToggle.addEventListener('click', () => {
  const isOpen = menuPanel.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', isOpen);
  const language = document.documentElement.lang;
  menuToggle.setAttribute('aria-label', translations[language][isOpen ? 'nav.closeMenu' : 'nav.openMenu']);
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    menuPanel.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

languageButtons.forEach((button) => {
  button.addEventListener('click', () => setLanguage(button.dataset.language));
});

// ── Back to top ────────────────────────────────────────────────────────────

const backToTopButton = document.querySelector('.back-to-top');
const reducedMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Shows the floating button once the user has scrolled away from the top.
 */
function updateBackToTopVisibility() {
  backToTopButton.hidden = window.scrollY <= 40;
}

window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });
updateBackToTopVisibility();
backToTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reducedMotionPreference.matches ? 'auto' : 'smooth' });
});

// ── Tech belt: infinite marquee of skills ──────────────────────────────────
// Continuous rAF scroll at baseBeltSpeed px/s toward the right. Dragging
// pauses the motion and converts the gesture into an impulse that decays
// exponentially back to the base speed. Honors prefers-reduced-motion (named
// reducedBeltMotion): no auto-scroll, manual drag/keys only.

const techBelt = document.querySelector('.tech-belt');
const techBeltTrack = document.querySelector('.tech-belt-track');
const techBeltGroup = document.querySelector('.tech-belt-group');
const reducedBeltMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const baseBeltSpeed = 45;
let beltSpeed = reducedBeltMotion.matches ? 0 : baseBeltSpeed;
let beltOffset = 0;
let beltGroupWidth = 0;
let beltPointerLastX = 0;
let beltDragDistance = 0;
let beltDragging = false;
let beltPointerId = null;
let beltFrame = 0;
let beltLastFrameTime = 0;

/**
 * Wraps the offset into [0, groupWidth) so the duplicated content
 * always covers the visible area, producing a seamless loop.
 */
function normalizeBeltOffset() {
  if (beltGroupWidth) beltOffset = ((beltOffset % beltGroupWidth) + beltGroupWidth) % beltGroupWidth;
}

/**
 * Paints the current offset as a GPU-friendly translate3d.
 */
function renderTechBelt() {
  normalizeBeltOffset();
  techBeltTrack.style.transform = `translate3d(${-beltOffset}px, 0, 0)`;
}

/**
 * Animation loop. While not dragging, advances the offset and relaxes
 * beltSpeed toward its base value with exponential decay.
 */
function animateTechBelt(timestamp) {
  beltFrame = 0;
  if (reducedBeltMotion.matches || document.hidden) return;
  if (!beltLastFrameTime) beltLastFrameTime = timestamp;
  const deltaTime = Math.min((timestamp - beltLastFrameTime) / 1000, 0.05);
  beltLastFrameTime = timestamp;

  if (!beltDragging) {
    beltOffset += beltSpeed * deltaTime;
    beltSpeed = baseBeltSpeed + (beltSpeed - baseBeltSpeed) * Math.exp(-deltaTime / 1.2);
    renderTechBelt();
  }
  beltFrame = window.requestAnimationFrame(animateTechBelt);
}

/**
 * Starts the loop, keeping a single active rAF instance
 * and skipping it entirely under prefers-reduced-motion.
 */
function startTechBeltAnimation() {
  if (reducedBeltMotion.matches || document.hidden || beltFrame) return;
  beltLastFrameTime = 0;
  beltFrame = window.requestAnimationFrame(animateTechBelt);
}

/**
 * Recalculates the group width (source of the wrap length)
 * whenever its rendered size changes.
 */
function resizeTechBelt() {
  beltGroupWidth = techBeltGroup.getBoundingClientRect().width;
  renderTechBelt();
}

techBelt.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  beltDragging = true;
  beltPointerId = event.pointerId;
  beltDragDistance = 0;
  beltPointerLastX = event.clientX;
  techBelt.classList.add('is-dragging');
  event.preventDefault();
});

window.addEventListener('pointermove', (event) => {
  if (!beltDragging || event.pointerId !== beltPointerId) return;
  const deltaX = event.clientX - beltPointerLastX;
  const dragSensitivity = deltaX > 0 ? 1.3 : 1;
  const adjustedDeltaX = deltaX * dragSensitivity;
  beltDragDistance += adjustedDeltaX;
  beltOffset -= adjustedDeltaX;
  renderTechBelt();
  beltPointerLastX = event.clientX;
  event.preventDefault();
});

/**
 * Ends a belt drag and converts the gesture into an impulse:
 * fast drags launch the belt in that direction, small drags
 * simply resume the base speed. Keyboard input (see the keydown
 * listener above) rides on the same beltSpeed variable.
 */
function finishTechBeltDrag(event) {
  if (!beltDragging || (event?.pointerId !== undefined && event.pointerId !== beltPointerId)) return;
  beltDragging = false;
  beltPointerId = null;
  techBelt.classList.remove('is-dragging');
  if (reducedBeltMotion.matches) {
    beltSpeed = 0;
  } else if (beltDragDistance > 6) {
    beltSpeed = -Math.min(360, baseBeltSpeed + beltDragDistance * 3);
  } else if (beltDragDistance < -6) {
    beltSpeed = Math.min(270, baseBeltSpeed + Math.abs(beltDragDistance) * 2);
  } else {
    beltSpeed = baseBeltSpeed;
  }
  startTechBeltAnimation();
}

window.addEventListener('pointerup', finishTechBeltDrag);
window.addEventListener('pointercancel', finishTechBeltDrag);
window.addEventListener('blur', () => finishTechBeltDrag());
techBelt.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  if (reducedBeltMotion.matches) {
    beltOffset += event.key === 'ArrowLeft' ? 120 : -120;
    renderTechBelt();
    return;
  }
  beltSpeed = Math.max(-300, Math.min(360, beltSpeed + (event.key === 'ArrowLeft' ? 180 : -180)));
  startTechBeltAnimation();
});

// ResizeObserver keeps the wrap width in sync; visibilitychange pauses
// the loop in background tabs; the change listener reacts to the user
// toggling prefers-reduced-motion at runtime.
if ('ResizeObserver' in window) new ResizeObserver(resizeTechBelt).observe(techBeltGroup);
else window.addEventListener('resize', resizeTechBelt);
document.addEventListener('visibilitychange', () => {
  if (document.hidden && beltFrame) {
    window.cancelAnimationFrame(beltFrame);
    beltFrame = 0;
  } else {
    startTechBeltAnimation();
  }
});
reducedBeltMotion.addEventListener?.('change', () => {
  if (beltFrame) window.cancelAnimationFrame(beltFrame);
  beltFrame = 0;
  beltSpeed = reducedBeltMotion.matches ? 0 : baseBeltSpeed;
  if (reducedBeltMotion.matches) {
    beltOffset = 0;
    techBeltTrack.style.transform = '';
  }
  renderTechBelt();
  startTechBeltAnimation();
});
resizeTechBelt();
startTechBeltAnimation();

// ── Project dialog: shared carousel for the three projects ────────────────
// One dialog serves all project cards. Opening a card (data-project-id)
// sets the description, the technologies list and the slides whose
// data-project-screenshot matches, then rebuilds the dot indicators.

const projectDialog = document.querySelector('#project-dialog');
const projectOpenButtons = document.querySelectorAll('.project-open');
const projectCloseButton = projectDialog.querySelector('.project-dialog-close');
const cvDialog = document.querySelector('#cv-dialog');
const cvOpenButton = document.querySelector('.cv-open');
const projectDescription = projectDialog.querySelector('.project-dialog-description p');
const projectTechnologyLists = [...projectDialog.querySelectorAll('.project-technology-list')];
const projectSlides = [...projectDialog.querySelectorAll('.project-slide')];
const projectScreenshotSlides = projectSlides.filter((slide) => slide.hasAttribute('data-project-screenshot'));
const carouselDotsContainer = projectDialog.querySelector('.project-carousel-dots');
const carouselDotsTrack = projectDialog.querySelector('.project-carousel-dots-track');
const visibleCarouselDotCount = 4;
const carouselDotStep = 17;
let activeProjectSlides = [];
let carouselDots = [];
let activeProjectSlide = 0;
let carouselPointerStart = null;

/**
 * Writes localized alt text for each screenshot slide, translating
 * the "Captura N de <proyecto>" pattern. Slides without images (none
 * today) are skipped defensively.
 */
function updateScreenshotAlt(language) {
  projectScreenshotSlides.forEach((slide) => {
    const number = slide.dataset.screenshotNumber;
    const projectNames = {
      1: 'Dynamic Users',
      2: 'Dynamic Centros Deportivos',
      3: 'HelpDesk Clínica Sagrada Familia'
    };
    const projectName = projectNames[slide.dataset.projectScreenshot];
    const image = slide.querySelector('img');
    if (!image) return;
    image.alt = language === 'en' ? `Screenshot ${number} of ${projectName}` : `Captura ${number} de ${projectName}`;
  });
}

// A language change must also re translate texts owned by this section
// that setLanguage cannot reach via data-i18n (JS-generated dots, etc.).
document.addEventListener('portfolio-language-change', (event) => {
  updateScreenshotAlt(event.detail.language);
  carouselDotsContainer.setAttribute('aria-label', event.detail.language === 'en' ? 'Choose screenshot' : 'Elegir captura');
  carouselDots.forEach((dot, index) => {
    dot.setAttribute('aria-label', event.detail.language === 'en' ? `Go to screenshot ${index + 1}` : `Ir a la captura ${index + 1}`);
  });
});

/**
 * Rebuilds one dot pill per active slide after a project dialog opens.
 */
function createCarouselDots(language) {
  carouselDots = activeProjectSlides.map((slide, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.carouselSlide = index;
    button.setAttribute('aria-label', language === 'en' ? `Go to screenshot ${index + 1}` : `Ir a la captura ${index + 1}`);
    return button;
  });
  carouselDotsTrack.replaceChildren(...carouselDots);
}

/**
 * Activates slide `index` cyclically: toggles `hidden`/`is-active` on the
 * slides of the open project, marks the matching dot, and scrolls the
 * dot rail so the current indicator stays visible (4 dots on screen,
 * 17px rail step).
 */
function showProjectSlide(index) {
  activeProjectSlide = (index + activeProjectSlides.length) % activeProjectSlides.length;
  projectSlides.forEach((slide) => {
    const slideIndex = activeProjectSlides.indexOf(slide);
    const isActive = slideIndex === activeProjectSlide;
    slide.hidden = slideIndex === -1 || !isActive;
    slide.classList.toggle('is-active', isActive);
  });
  carouselDots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === activeProjectSlide;
    dot.classList.toggle('is-active', isActive);
    dot.setAttribute('aria-current', isActive ? 'true' : 'false');
  });
  const firstVisibleDot = Math.min(
    Math.max(activeProjectSlide - 1, 0),
    Math.max(carouselDots.length - visibleCarouselDotCount, 0)
  );
  carouselDotsTrack.style.transform = `translate3d(${-firstVisibleDot * carouselDotStep}px, 0, 0)`;
}

// Opening: assign per-project content, pick the matching slide set and
// only then show the modal, so the dialog is consistent before it paints.
projectOpenButtons.forEach((button) => button.addEventListener('click', () => {
  const projectId = Number(button.dataset.projectId);
  projectDialog.classList.toggle('project-dialog--portrait', projectId === 1);
  const descriptionKey = projectId === 1
    ? 'projectOne.description'
    : projectId === 2 ? 'projectTwo.description' : 'projectThree.description';
  projectDescription.dataset.i18n = descriptionKey;
  projectDescription.classList.toggle('project-description-wide', projectId === 2 || projectId === 3);
  projectDescription.textContent = translations[document.documentElement.lang][descriptionKey];
  projectTechnologyLists.forEach((list) => {
    list.hidden = Number(list.dataset.projectTechnologies) !== projectId;
  });
  activeProjectSlides = projectScreenshotSlides.filter((slide) => slide.dataset.projectScreenshot === String(projectId));
  createCarouselDots(document.documentElement.lang);
  showProjectSlide(0);
  projectDialog.showModal();
}));
// Interactions: buttons and dots as primary controls, arrow keys for
// keyboard users, and touch swipes on mobile (48px+ threshold).

projectCloseButton.addEventListener('click', () => projectDialog.close());
projectDialog.querySelectorAll('[data-carousel-step]').forEach((button) => {
  button.addEventListener('click', () => showProjectSlide(activeProjectSlide + Number(button.dataset.carouselStep)));
});
carouselDotsContainer.addEventListener('click', (event) => {
  const button = event.target.closest('[data-carousel-slide]');
  if (button) showProjectSlide(Number(button.dataset.carouselSlide));
});
projectDialog.addEventListener('click', (event) => {
  if (event.target === projectDialog) projectDialog.close();
});
projectDialog.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') showProjectSlide(activeProjectSlide - 1);
  if (event.key === 'ArrowRight') showProjectSlide(activeProjectSlide + 1);
});
projectDialog.querySelector('.project-carousel').addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'touch') carouselPointerStart = event.clientX;
});
projectDialog.querySelector('.project-carousel').addEventListener('pointerup', (event) => {
  if (carouselPointerStart === null) return;
  const swipeDistance = event.clientX - carouselPointerStart;
  if (Math.abs(swipeDistance) > 45) showProjectSlide(activeProjectSlide + (swipeDistance < 0 ? 1 : -1));
  carouselPointerStart = null;
});
projectDialog.querySelector('.project-carousel').addEventListener('pointercancel', () => {
  carouselPointerStart = null;
});

// ── Résumé (CV) dialog ─────────────────────────────────────────────────────
// Opening/closing only; rendering lives in pdf-viewer.js.

cvOpenButton.addEventListener('click', () => cvDialog.showModal());
cvDialog.querySelector('.cv-dialog-close').addEventListener('click', () => cvDialog.close());
cvDialog.addEventListener('click', (event) => {
  if (event.target === cvDialog) cvDialog.close();
});

// ── 3D scene sync: update section labels when a node is picked ────────────

document.addEventListener('portfolio-scene-node-change', (event) => {
  selectedSceneNode = event.detail.nodeIndex;
});

// Boot: honor a previously stored language when storage is available.

let initialLanguage = 'es';
try {
  const savedLanguage = localStorage.getItem('portfolio-language');
  if (translations[savedLanguage]) initialLanguage = savedLanguage;
} catch (error) {
  // Storage can be disabled by browser privacy settings; default to Spanish.
}
setLanguage(initialLanguage);

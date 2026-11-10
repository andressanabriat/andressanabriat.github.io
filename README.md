# Andrés Sanabria — Portafolio

> Técnico Superior en Desarrollo de Aplicaciones Multiplataforma (DAM)
> **Sitio en línea:** <https://andressanabriat.github.io>

Portafolio personal bilingüe (ES/EN) construido con HTML, CSS y JavaScript
puro: escena 3D interactiva en el hero, carruseles de proyectos reales,
galería de capturas en pantalla completa para móvil y un visor de CV
integrado con zoom, giro e impresión.

## Características

- **Escena 3D (Three.js 0.180 desde CDN):** rotación por arrastre y
  selección de nodos que describen Código, Producto y Emprendimiento.
- **Carruseles de proyectos:** Dynamic Users, Dynamic Sports Centers y
  HelpDesk Clínica Sagrada Familia, con diapositivas reales de cada app.
- **Galería móvil:** al tocar una captura, esta se abre a pantalla
  completa con navegación por gestos, flechas, teclado y contador.
- **Visor de CV (PDF.js desde CDN):** zoom, ajuste de página, giro,
  impresión y descarga directa del PDF.
- **Bilingüe ES/EN** con selección persistente durante la navegación.
- **Responsive:** móvil, tablet y escritorio; soporte para
  `prefers-reduced-motion` y navegación por teclado.

## Estructura del proyecto

> Nota: `AGENTS.md` y `MEMORY.md` (guías internas de trabajo del
> repositorio local) no forman parte del sitio publicado.

```
├── index.html              # Página única: todas las secciones y diálogos
├── styles.css              # Estilos del sitio (variables, componentes, responsive)
├── script.js               # Interacción general (i18n, navegación, carruseles, galería)
├── scene.js                # Escena 3D del hero (Three.js)
├── about-art.js            # Red generativa decorativa de la sección "Yo"
├── pdf-viewer.js           # Visor del CV (PDF.js)
├── favicon.svg             # Monograma del navegador
├── Curriculum_Andres_S.pdf # CV descargable e integrado
└── Capturas Proyectos/     # Pantallazos reales de los proyectos (por proyecto)
```

## Ejecución en local

Se necesita un servidor local (los módulos ES y el PDF no cargan con
`file://`):

```bash
python3 -m http.server 8000
# después abrir http://localhost:8000
```

## Notas técnicas

- La escena del hero requiere **WebGL**; existe una composición de
  respaldo si el navegador no lo soporta.
- Three.js y PDF.js se cargan desde CDN, por lo que es necesaria
  conexión a internet en la primera visita.
- Se respetan las preferencias de accesibilidad del sistema
  (`prefers-reduced-motion`).

---

© 2026 Andrés Sanabria. Contenido, diseño y proyectos reservados.
La reutilización del portafolio o de sus materiales requiere autorización.

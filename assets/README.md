# Assets de Groud

Todo lo visual y editable del sitio vive aquí. No necesitas tocar el HTML/CSS/JS para
cambiar logos o imágenes — solo reemplaza el archivo respetando el mismo nombre y formato.

## /logos
- `groud-mark-light.svg` — el ícono "g" en color claro (crema). Se usa en el header y el
  preloader, siempre sobre fondos oscuros.
- `groud-mark-dark.svg` — el mismo ícono en tinta oscura, para fondos claros (por si en el
  futuro se usa en el footer o el menú).

Para cambiar el logo: reemplaza el SVG manteniendo el mismo nombre de archivo y un viewBox
similar (100 x 130). Si usas un logo con proporciones muy distintas, ajusta el `width` de
`.nav-mark svg` y `.pre-mark` en `assets/css/style.css`.

## /images/hero
- `background.jpg` (opcional) — si agregas una imagen aquí, se muestra detrás de la
  animación de constelación del hero, a modo de fondo. Si el archivo no existe, el hero
  simplemente se queda con el fondo de color + partículas (no rompe nada).

## /images/campaigns
- `campaign-01.jpg`, `campaign-02.jpg`, `campaign-03.jpg`, `campaign-04.jpg` (opcionales) —
  si agregas una imagen con ese nombre exacto, reemplaza automáticamente el visual
  generativo (canvas) de esa tarjeta de campaña, tanto en el grid como al abrir el detalle.
  Recomendado: 1600×2000px o más, formato retrato, JPG o WEBP.

## /images/og
- `share.jpg` (opcional, 1200×630px) — imagen para previsualizaciones al compartir el link
  en redes o WhatsApp. Actualmente no está conectada en el `<head>`; si la agregas, añade
  esta línea dentro de `<head>` en `index.html`:
  `<meta property="og:image" content="assets/images/og/share.jpg">`

## Reglas rápidas
- Respeta los nombres de archivo exactos (minúsculas, con guiones).
- JPG/WEBP para fotos, SVG para logos e íconos.
- Si un archivo no existe, el sitio no se rompe: usa su fallback (color o canvas generativo).

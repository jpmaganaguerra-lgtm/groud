# Imágenes — Pitch The Fourth Set

Todas las imágenes son **opcionales**: si el archivo no existe, el pitch se ve completo igual
(el JS esconde el `<img>` y queda el color de marca de fondo). Sube solo las que tengas.

| Archivo | Dónde aparece | Tamaño sugerido | Qué debe mostrar |
|---|---|---|---|
| `hero.jpg` | Portada (sección 00) | 2400 × 1600 px, horizontal | Ambiente nocturno o atardecer: cancha + gente + mesa en el mismo cuadro. Que se vea social, no deportivo. Se oscurece automáticamente con una capa encima, así que puede ser una foto con luz. |
| `cuarta-visita.jpg` | Sección 04 — La tesis (foto a pantalla completa) | 2400 × 1600 px, horizontal | Gente, no arquitectura. Un grupo en la mesa después de jugar, en confianza. Es el momento emocional del pitch: idealmente candid, no posada. |

## Formato

- `.jpg` o `.webp`. Si usas `.webp`, cambia la extensión en el `index.html` (`data-src="img/hero.webp"`).
- Comprimir antes de subir: menos de 500 KB por imagen.
- Nunca usar `<img src>` directo — siempre `data-src`, para que el fallback funcione.

## Nota

Este README existe también para que la carpeta no desaparezca del .zip ni de git cuando está vacía.

# Estudio de tinta 01

Comparación de los seis diseños con su acabado sutil original, un acabado estampado y otro gastado. **Gastado es el acabado elegido para la colección principal.** Los originales sutiles se conservan en `baseline/`, con sus fuentes limpias históricas en `baseline/clean/`; la comparación mantiene las composiciones anteriores y no depende del dibujo ni del acabado principal actual. Mendoza no forma parte de esta prueba histórica. Esta prueba no se incluye en el paquete npm.

## Reproducir

Desde la raíz del proyecto:

```sh
npm run build
node experiments/ink/build.mjs
npm run preview
```

Abrí http://127.0.0.1:4173/experiments/ink/ y elegí un país. Cada acabado se muestra en grande y a 140 px, con enlace de descarga.

## Medición

`metrics.json` registra bytes reales y tamaño gzip de cada archivo. La tabla de la página muestra KB decimales (1 KB = 1.000 bytes), sin compresión HTTP. Los tamaños gzip son una medición de compresión local, no una afirmación de que el servidor de vista previa use gzip.

| País | Limpio (B) | Sutil original (B) | Estampado (B) | Gastado (B) |
| --- | ---: | ---: | ---: | ---: |
| AR | 1420 | 3374 | 2383 | 2381 |
| BR | 1302 | 3256 | 2265 | 2263 |
| IT | 1268 | 3222 | 2231 | 2229 |
| JP | 1355 | 3309 | 2318 | 2316 |
| US | 1267 | 3221 | 2230 | 2228 |
| FR | 1292 | 3246 | 2255 | 2253 |
| **Total** | **7904** | **19628** | **13682** | **13670** |

Los dos acabados nuevos pesan aproximadamente un 30% menos que el sutil original. El sutil original enumera muchos cortes como paths; los nuevos describen el grano con un filtro compacto. El gastado tiene casi el mismo peso que el estampado porque cambia los parámetros, no agrega geometría.

## Tratamiento visual

Dos escalas de ruido modifican la transparencia: poros pequeños y variaciones amplias de presión. Un desplazamiento mínimo rompe los bordes perfectos; un desenfoque leve simula absorción de tinta. No se agrega papel al SVG. La textura de fondo pertenece únicamente a la página de comparación.

La tipografía es la misma que en los originales para aislar el efecto de tinta; todavía no se convirtió a curvas. Las semillas son fijas para evitar cambios aleatorios entre generaciones.

## Observaciones y límites

Se revisaron visualmente los seis países y sus miniaturas en el navegador integrado, además del selector de país. El estampado conserva mejor los detalles pequeños; el gastado pierde parte de los textos secundarios. Se eligió gastado por preferencia visual del usuario; a tamaños pequeños pierde más detalle secundario que estampado.

Se verificaron XML, títulos, referencias locales de filtros y ausencia de imágenes incrustadas o recursos externos. La generación es determinista y `npm run check` sigue verificando los originales.

No se midió el tiempo de renderizado ni se realizó validación en Safari, Firefox, React Native, PDF o herramientas de diseño. Menor tamaño de descarga no garantiza menor trabajo gráfico. Antes de elegir filtros como formato definitivo, hay que probar los destinos reales; las exportaciones PNG/WebP siguen siendo una opción para obtener una apariencia fija.

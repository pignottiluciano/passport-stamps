# Passport Stamps

Colección original de sellos de viaje en SVG, pensada para webs, apps y mapas de países visitados. Primera edición: Argentina, Brasil, Italia, Japón, Estados Unidos y Francia.

Cada destino tiene una composición propia y dos acabados: **tinta** con desgaste sutil y **limpio** sin textura. Fondo transparente, sin imágenes incrustadas, fuentes descargables ni dependencias de ejecución.

## Ver la colección

Requiere Node.js 20+ para generar/verificar archivos y Python 3 para el servidor opcional. No requiere instalar paquetes.

```sh
npm run build
npm run check
npm run preview
```

Abrí http://127.0.0.1:4173/preview/. También podés abrir `preview/index.html` directamente en el navegador.

## Prueba de tinta

Hay una [comparación experimental de tres acabados](experiments/ink/README.md) para los seis países. Se genera con `node experiments/ink/build.mjs` y se abre en `/experiments/ink/` con el mismo servidor. Los originales y el contenido del paquete npm no cambian.

## Archivos

| País | Tinta | Limpio |
| --- | --- | --- |
| Argentina | [ar.svg](svg/ar.svg) | [ar.svg](svg/clean/ar.svg) |
| Brasil | [br.svg](svg/br.svg) | [br.svg](svg/clean/br.svg) |
| Italia | [it.svg](svg/it.svg) | [it.svg](svg/clean/it.svg) |
| Japón | [jp.svg](svg/jp.svg) | [jp.svg](svg/clean/jp.svg) |
| Estados Unidos | [us.svg](svg/us.svg) | [us.svg](svg/clean/us.svg) |
| Francia | [fr.svg](svg/fr.svg) | [fr.svg](svg/clean/fr.svg) |

Los archivos limpios pesan aproximadamente **1,2–1,4 KiB** y los de tinta **3,1–3,3 KiB** sin compresión HTTP. `manifest.json` registra el peso exacto, país, ciudad, color y rutas. El generador rechaza archivos mayores de 10 KiB.

## Usar en una web o en Angular

Copiá los SVG que necesites a los assets públicos de tu aplicación. No hace falta un componente ni una dependencia de Angular para mostrar una imagen.

```html
<img src="/stamps/ar.svg" alt="Argentina — Buenos Aires" width="240" height="180">
```

En Angular 20+, por ejemplo, copiá `svg/ar.svg` a `public/stamps/ar.svg`. En una lista, usá `manifest.json` como catálogo y cargá solo los destinos visibles.

Todos comparten un `viewBox` de 400 × 300 con espacio transparente alrededor del diseño. El texto permanece editable y usa fuentes del sistema: Arial/Helvetica, Georgia y la fuente japonesa disponible. Puede haber diferencias tipográficas entre plataformas. Esta edición prioriza peso y edición; no promete una reproducción idéntica en todos los sistemas.

Para modificar un color, editá el dato en `data/countries.json` y regenerá. Un SVG usado mediante `<img>` no hereda el color CSS de la página.

## Sumar países y editar diseños

- `data/countries.json`: códigos de país de dos letras, nombre, ciudad, color, forma, símbolo y código decorativo.
- `scripts/build.mjs`: formas y símbolos vectoriales originales; `composition()` define la composición de cada país.
- `svg/` y `svg/clean/`: entregables generados, incluidos en Git para usarlos directamente.
- `preview/`: catálogo estático, sin framework ni JavaScript en el navegador.

Para sumar un país, agregá sus datos y una composición explícita en el generador; luego corré `npm run build` y `npm run check`. El generador usa máscaras vectoriales con pequeñas interrupciones de tinta deterministas: no incorpora bitmaps ni filtros de ruido. Compartimos el sistema de dibujo, pero cada destino tiene su propia distribución.

No editar los SVG generados directamente: la próxima generación reemplaza esos cambios. Si insertás el mismo SVG varias veces como código inline, asigná identificadores únicos a sus títulos y máscaras; usar `<img>` evita conflictos de IDs.

## Alcance y licencia

Diseños decorativos originales inspirados en sellos de viaje. Los códigos de aeropuertos son detalles gráficos: estos sellos no representan documentos ni marcas migratorias oficiales. No se copiaron ni vectorizaron los recursos de referencia.

Código y arte bajo [MIT](LICENSE), incluido uso comercial. El paquete está marcado como privado para evitar publicaciones accidentales; todavía no está publicado en npm ni vinculado a un remoto de Git.

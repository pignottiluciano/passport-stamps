# Passport Stamps

Biblioteca original de sellos de viaje para webs, apps y mapas. SVG independientes de cualquier framework, con fondo transparente y dos acabados: **gastado** (principal) y **limpio**.

La primera colección reúne seis países y Mendoza como destino de Argentina. Cada sello tiene su propia composición y un símbolo vectorial original, sin imágenes incrustadas ni recursos externos.

## Ver la colección

Node.js 20+ para generar y verificar. Python 3 para el servidor opcional. No requiere instalar paquetes.

```sh
npm run build
npm run check
npm run preview
```

Abrí http://127.0.0.1:4173/preview/ o directamente `preview/index.html`.

## Colección

| ID | Tipo | País o destino | Símbolo | Gastado | Limpio |
| --- | --- | --- | --- | --- | --- |
| `ar` | País | Argentina | Sol | [SVG](svg/ar.svg) | [SVG](svg/clean/ar.svg) |
| `br` | País | Brasil | Cristo Redentor | [SVG](svg/br.svg) | [SVG](svg/clean/br.svg) |
| `it` | País | Italia | Coliseo | [SVG](svg/it.svg) | [SVG](svg/clean/it.svg) |
| `jp` | País | Japón | Monte Fuji | [SVG](svg/jp.svg) | [SVG](svg/clean/jp.svg) |
| `us` | País | Estados Unidos | Estatua de la Libertad | [SVG](svg/us.svg) | [SVG](svg/clean/us.svg) |
| `fr` | País | Francia | Torre Eiffel | [SVG](svg/fr.svg) | [SVG](svg/clean/fr.svg) |
| `ar-mendoza` | Destino | Mendoza, Argentina | Uvas y Andes | [SVG](svg/ar-mendoza.svg) | [SVG](svg/clean/ar-mendoza.svg) |

En los sellos de país, el país es protagonista y una ciudad aparece como referencia secundaria. Los destinos tienen un sello propio con su país de pertenencia. La elección de un monumento es una referencia cultural de diseño, no un símbolo nacional oficial.

Los gastados pesan aproximadamente **2,26–2,60 KB** cada uno, sin compresión HTTP; 1 KB = 1.000 bytes. El generador rechaza archivos mayores de 10 KiB. `manifest.json` contiene las rutas y los pesos exactos.

## Usar en React, Angular o HTML

Copiá los archivos que necesites a los assets públicos de tu aplicación. No hace falta un componente específico.

```html
<img src="/stamps/ar-mendoza.svg" alt="Mendoza, Argentina — Uvas y Andes" width="240" height="180">
```

En Angular 20+, por ejemplo, copiá el SVG a `public/stamps/ar-mendoza.svg`. React admite el mismo elemento de imagen. El paquete no depende de ninguno de los frameworks.

Los textos usan fuentes del sistema (Arial/Helvetica, Georgia y una fuente japonesa disponible), por lo que puede haber diferencias entre plataformas. Las letras todavía no están convertidas a curvas. Todos los SVG tienen un lienzo de 400 × 300 y espacio transparente alrededor del sello.

## Catálogo y estructura

- `data/stamps.json`: datos de países y destinos, color, forma y símbolo.
- `scripts/build.mjs`: símbolos, composiciones y generación de archivos.
- `scripts/ink.mjs`: acabado gastado determinista compartido con las pruebas.
- `svg/` y `svg/clean/`: entregables generados, incluidos en Git para uso directo.
- `manifest.json`: catálogo con metadatos y tamaños reales.
- `preview/`: galería estática, sin framework ni JavaScript de aplicación.

Cada entrada tiene un `id` único: `ar` para un país, `ar-mendoza` para un destino. `code` es el código ISO del país al que pertenece; por eso Argentina y Mendoza comparten `code: "AR"`. Usá **`id` como clave** en listas y búsquedas.

`kind` distingue `country` de `destination`. `countryName` identifica al país, `city` la ciudad de referencia, `icon` el dibujo interno e `iconLabel` su descripción. `file` y `cleanFile` apuntan a los entregables. Las rutas anteriores de los seis países siguen vigentes.

## Editar o sumar sellos

Agregá los datos en `data/stamps.json` y una composición explícita en `composition()` del generador. Dibujá un símbolo simple y reconocible, revisá el SVG en grande y en pequeño, y corré `npm run build` seguido de `npm run check`.

No edites los SVG generados directamente: regenerar reemplaza esos cambios. Para cambiar un color, editá los datos y regenerá. Un SVG mostrado con `<img>` no hereda el color CSS de la página.

Los filtros simulan poros, variación de presión y absorción sin agregar un fondo de papel. Su peso reducido no equivale a costo de renderizado nulo. Antes de usar muchos sellos juntos, probalos en los dispositivos de destino. Si insertás SVG como código inline repetido, asigná IDs únicos a títulos y filtros; con `<img>` no hay conflictos entre documentos.

## Prueba histórica de tinta

La [comparación de acabados](experiments/ink/README.md) conserva los seis diseños anteriores y sus medidas. Se reproduce con `node experiments/ink/build.mjs` y se abre en `/experiments/ink/`. Se mantienen sus dibujos históricos para que los resultados sigan siendo comparables; Mendoza no forma parte de esa prueba. Los experimentos no se distribuyen en el paquete npm.

## Licencia y distribución

Código y arte bajo [MIT](LICENSE), incluido uso comercial. Los dibujos son originales: no se copiaron ni vectorizaron recursos de terceros. Son sellos decorativos, no documentos ni marcas migratorias oficiales.

El paquete sigue privado, sin publicar en npm ni vincular a un remoto de Git. Distribuye SVG, catálogo y documentación; el generador se mantiene en el repositorio.

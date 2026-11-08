# Passport Stamps

**193 países miembros de la ONU y 60 destinos** en SVG originales con acabado de tinta gastada. Los sellos de países no contienen nombres de ciudades ni códigos de aeropuertos. Cada archivo tiene fondo transparente y una alternativa limpia.

La colección de países usa 129 motivos de arquitectura, naturaleza y cultura; algunos se comparten entre países. Los diseños combinan seis familias de marcos, composiciones adaptadas al nombre y una paleta de tintas. Los motivos son decisiones de diseño, no emblemas nacionales oficiales.

## Ver y descargar

```sh
npm run build
npm run check
npm run preview
```

Abrí http://127.0.0.1:4173/preview/. La galería permite buscar por nombre en español o inglés, código y símbolo; filtrar por región y recorrer páginas de 24 sellos. En destinos, el filtro cambia de región a país. También se puede abrir `preview/index.html` directamente.

Se requiere Node.js 20+ para generar/verificar y Python 3 solo para el servidor opcional. No hay paquetes que instalar ni dependencias de ejecución.

## Archivos y peso

- `svg/ar.svg`: acabado gastado, principal.
- `svg/clean/ar.svg`: alternativa limpia.
- `manifest.json`: **193 países**, sin ciudades ni destinos mezclados.
- `destinations.json`: **60 destinos**, separados de los países: Argentina (20), España (10), Francia (10), Alemania (10) e Italia (10).

Los 193 SVG gastados pesan **416.716 bytes en total** (416,72 KB sin compresión), entre **1.976 y 2.829 bytes por país**. El generador impone un máximo de 10 KiB por archivo. El catálogo registra las medidas exactas.

Las rutas de los seis países iniciales siguen vigentes. Los sellos de país ya no muestran Buenos Aires, Río, Roma, Tokio, Nueva York ni París: los monumentos pueden seguir representando al país. Mendoza conserva su archivo `svg/ar-mendoza.svg`, dentro del catálogo de destinos; no forma parte del conteo de países.

## Destinos

La colección inicial tiene **60 destinos y 120 SVG** (gastados y limpios). Los gastados pesan entre **2.033 y 2.568 bytes**; juntos suman **133.603 bytes**. [Lista completa y descargas individuales](docs/DESTINATIONS.md).

Abrí la [galería de destinos](http://127.0.0.1:4173/preview/?collection=destinations). El filtro permite elegir Argentina, España, Francia, Alemania o Italia. También hay enlaces directos por país, por ejemplo `/preview/?collection=destinations&country=AR`.

Los nombres grandes del arte respetan las formas locales (MÜNCHEN, FIRENZE, MARSEILLE); la galería mantiene nombres comunes en español y aliases para buscar. `ar-cordoba` y `es-cordoba` son archivos distintos con símbolos propios.

Los destinos agregan `countryLabel`, `adminArea`, `destinationType` y, cuando corresponde, `aliases`, `associationNote` o `landmarkLocality`. Mont-Saint-Michel es un destino monumental; el sello de Füssen indica que Neuschwanstein se encuentra en Schwangau. Los motivos naturales pueden representar el entorno turístico del destino.

## React, Angular, Vue o HTML

Copiá los SVG que necesites a los assets públicos de tu aplicación:

```html
<img src="/stamps/jp.svg" alt="Japón — Monte Fuji" width="240" height="180">
```

React admite el mismo elemento; Angular 20+ puede servir el archivo desde `public/stamps/jp.svg`. No se requiere un componente específico. Si más adelante se necesitan controles propios de un framework, podrán usar los mismos recursos.

El paquete está preparado para distribuir archivos y catálogos por subrutas. Sigue **privado y sin publicar**: no se verificó disponibilidad del nombre ni se creó un remoto de Git.

```text
@passport-stamps/core/svg/jp.svg
@passport-stamps/core/manifest.json
@passport-stamps/core/destinations.json
```

La resolución de una importación de SVG depende del compilador de cada aplicación; copiarlo a sus assets públicos es la opción directa e independiente del framework. El generador vive en Git y no se incluye en el paquete de recursos.

## Datos e identificadores

Cada país usa su código ISO en minúscula como `id` (`ar`, `jp`, `ca`). Los destinos usan prefijo del país (`ar-mendoza`). `code` mantiene el ISO en mayúscula. Usá **`id` como clave**.

Los países tienen `name` y `countryName` para mostrar en español, `officialName` según la fuente de membresía y `label` para el texto del sello. Las etiquetas del arte usan nombres comunes en inglés y conservan los rótulos de los seis diseños iniciales. Los nombres largos se distribuyen en hasta tres líneas.

`region` usa cinco agrupaciones geográficas para navegar: Africa, Americas, Asia, Europe y Oceania. No pretende reproducir una clasificación política. `icon` y `iconLabel` identifican el motivo, `shape` el marco, `file` y `cleanFile` las rutas, y `bytes` y `cleanBytes` el peso sin comprimir.

## Estructura y edición

- `data/stamps.json`: decisiones editoriales y visuales, con los 193 países y los 60 destinos.
- `data/un-members.json`: lista de membresía y códigos contrastados con la ONU, con fuente y fecha.
- `scripts/icons.mjs`: motivos de los países.
- `scripts/destination-icons.mjs`: siluetas originales de los nuevos destinos.
- `scripts/build.mjs`: marcos, composiciones, nombres y exportaciones.
- `scripts/ink.mjs`: textura de tinta determinista.
- `scripts/gallery.mjs`: galería de documentación.
- `tests/catalog.test.mjs`: contratos de cobertura, países sin ciudades, recursos y tamaños.

Para editar un símbolo o una composición, cambiá las fuentes y corré `npm run build` y `npm run check`. No edites los SVG generados directamente: regenerar reemplaza esos cambios. Para cambiar un color, editá los datos y regenerá.

Antes de incorporar países al catálogo principal, actualizá explícitamente la referencia de membresía. No se agregan territorios u observadores para completar el número. Otros destinos pertenecen al catálogo separado.

## Renderizado

Todos los SVG usan un `viewBox` de 400 × 300. No tienen bitmaps incrustados ni descargas externas. Los filtros simulan poros, presión desigual y absorción de tinta. Las semillas son fijas para mantener el mismo aspecto entre generaciones.

La fuente sigue siendo editable y usa Arial/Helvetica, Georgia y una fuente japonesa disponible. Todavía no se convirtió a curvas; la tipografía puede variar entre plataformas. Un SVG mostrado con `<img>` no hereda el color CSS de la página.

Si se inserta código SVG inline repetido, hay que asignar IDs únicos a títulos y filtros. Con `<img>` cada archivo tiene su propio documento. Los filtros compactos ahorran bytes, pero no se midió su costo gráfico en todos los dispositivos. Las variantes limpias permiten usar el arte sin esos filtros.

## Historial de tinta

La [prueba de acabados](experiments/ink/README.md) conserva las seis composiciones anteriores, incluidos sus nombres de ciudades históricos. Sus medidas no describen la colección actual de 193 países. Se regenera con `node experiments/ink/build.mjs` y se abre en `/experiments/ink/`. No se distribuye como parte del paquete.

## Fuente y licencia

La cobertura se verificó el **7 de noviembre de 2026** contra la [lista oficial de miembros de la ONU](https://www.un.org/about-us/member-states). [Fuentes y alcance](docs/SOURCES.md).

Código y arte bajo [MIT](LICENSE), incluido uso comercial. Los dibujos son originales: no se copiaron ni vectorizaron los gráficos de la ONU ni recursos de terceros. Estos sellos son decorativos y no representan documentos ni marcas migratorias oficiales.

# Verificación de la colección de 193 países

Revisada el 7 de noviembre de 2026.

- `npm run check`: reproducción exacta de los archivos, inventario, presupuesto de peso y contratos de catálogo mediante Node Test Runner.
- Referencia oficial: 193 códigos únicos, sin faltantes ni entradas ajenas a la lista verificada de la ONU.
- `manifest.json`: 193 países sin campo de ciudad ni seriales de aeropuertos. `destinations.json`: Mendoza, aparte.
- Se analizaron los 388 SVG (193 países y un destino, con dos acabados) con el parser XML estándar de Python: títulos, IDs y referencias válidos, pesos exactos y ausencia de scripts, imágenes incrustadas y recursos externos.
- Se recorrieron visualmente las nueve páginas de la galería. Se corrigió la separación de los nombres de tres líneas para evitar que atravesaran el separador del sello.
- Se comprobaron búsqueda sin tildes (`japon`), dos resultados para `congo`, 14 países para Oceanía, búsqueda vacía de resultados, paginación y Mendoza separado.
- Vista móvil a 390 px: búsqueda y composición en una columna, sin desbordamiento horizontal observado.
- La comparación histórica de tinta se regenera desde su propio catálogo y SVG de referencia; agregar países no altera sus seis muestras originales.

Los 193 gastados suman 416.716 bytes sin compresión. El menor pesa 1.976 bytes y el mayor 2.829 bytes.

La revisión visual se realizó en el navegador integrado. No es una validación de la tipografía en todas las plataformas ni un benchmark de renderizado. El paquete no se publicó en npm.

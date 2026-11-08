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


## Ampliación: 60 destinos

- Cobertura exacta de la lista acordada: AR 20, ES 10, FR 10, DE 10 e IT 10; 60 IDs únicos y 120 SVG de destinos.
- Cinco controles automáticos mediante `npm run check`, incluyendo pertenencia al país, región y separación de catálogos; las dos Córdoba tienen motivos distintos.
- Los 506 SVG de la colección completa se analizaron como XML. Se compararon los archivos de los 193 países y el SVG de Mendoza con el commit anterior: no cambiaron.
- Revisión visual de las tres páginas de destinos; ajuste de los hitos altos en marcos rectangulares para evitar el borde punteado. Revisión posterior de Mont-Saint-Michel y Füssen.
- Verificados filtros de los cinco países, búsqueda `cordoba` con dos resultados y uno al filtrar España, alias `Munich`, búsqueda `fussen`, enlace directo a España, regreso a los 193 países y filtro regional Europa.
- Vista móvil a 390 px: un sello por fila, sin desbordamiento horizontal observado.

Los 60 gastados suman 133.603 bytes; rango de 2.033 a 2.568 bytes por SVG. El paquete sigue sin publicar en npm.

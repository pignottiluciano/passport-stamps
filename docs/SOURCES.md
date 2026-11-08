# Cobertura del catálogo

Fecha de verificación: 2026-11-07.

## Fuente principal

United Nations, [Member States](https://www.un.org/about-us/member-states).

Se contrastaron 193 entradas de miembros y sus códigos de país. La referencia reproducible está en `data/un-members.json`: código, nombre de la entrada oficial, fecha y enlace de origen. Los nombres oficiales se preservan en `officialName`; la galería utiliza nombres comunes en español.

Confirmación del alcance: United Nations Dag Hammarskjöld Library, [Current UN Member States Resources](https://research.un.org/en/unmembers/currentmembers), que señala 193 miembros actuales.

La lista no incorpora territorios, estados observadores ni otros lugares. Mendoza se mantiene fuera del catálogo de miembros.

## Nombres, regiones y dibujos

Los rótulos comunes en español e inglés se prepararon con los datos de regiones de Intl.DisplayNames del entorno local y se fijaron en `data/stamps.json`, con ajustes editoriales para nombres largos y los seis diseños originales. El build no cambia nombres por actualizar el entorno ni consulta servicios externos.

Las cinco regiones de navegación y la selección de símbolos son decisiones de esta biblioteca. Se usan motivos naturales, culturales y arquitectónicos; no se afirma que todos sean símbolos nacionales oficiales ni únicos de un país. Los 193 sellos utilizan 129 motivos diferentes, algunos compartidos.

La ONU se cita como fuente de los hechos de membresía, no como autora ni avalista del arte. No se reutilizaron banderas, logotipos, ilustraciones ni archivos gráficos de la ONU. La licencia MIT corresponde al código y los dibujos originales de este repositorio.


## Destinos: referencias de monumentos y alcance

La selección de 60 lugares fue acordada con el usuario: 20 de Argentina y 10 de cada uno de España, Francia, Alemania e Italia. No es una clasificación oficial de importancia turística.

Referencias primarias consultadas para asociaciones y nombres:

- [Monumento Nacional a la Bandera](https://www.monumentoalabandera.gob.ar/), Rosario.
- [Turismo de Madrid: Oso y Madroño](https://www.esmadrid.com/informacion-turistica/oso-madrono).
- [Spain.info: Córdoba](https://www.spain.info/es/destino/cordoba/), Mezquita-Catedral.
- [Notre-Dame de Fourvière](https://www.fourviere.org/fr/visiter-notre-dame-de-fourviere/), Lyon.
- [Turismo de Marsella: Notre-Dame de la Garde](https://www.marseille-tourisme.com/decouvrez-marseille/culture-et-patrimoine/sites-et-monuments/la-basilique-notre-dame-de-la-garde/).
- [Administración de palacios de Baviera: Neuschwanstein](https://neuschwanstein.de/englisch/tourist/howtoget.htm), cerca de Schwangau y Füssen.
- [Bologna Welcome: las Dos Torres](https://www.bolognawelcome.com/en/places/towers-historic-buildings/the-two-towers-garisenda-and-degli-asinelli-eng).
- [Italia.it: Alberobello y los trulli](https://www.italia.it/en/puglia/things-to-do/alberobello).

Estas fuentes sirven como referencias factuales, no como fuentes de ilustraciones. Las siluetas SVG se dibujaron para esta colección, sin descargar ni vectorizar sus fotografías o gráficos. `associationNote` aclara hitos del entorno que no están dentro de la ciudad; Mont-Saint-Michel se clasifica como destino monumental.

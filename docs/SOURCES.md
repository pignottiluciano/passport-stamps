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

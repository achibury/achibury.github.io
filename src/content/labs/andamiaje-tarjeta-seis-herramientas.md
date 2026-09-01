---
titulo: "ANDAMIAJE DE PRUEBA — tarjeta con seis herramientas"
resumen: "Archivo de prueba de maquetación, sin contenido real. Existe para que la tarjeta del listado tenga seis herramientas y se vea el tope de cuatro con el indicador +2."
fecha: 2026-08-15
categoria: "notas"
herramientas: ["Wazuh", "Sigma", "Zeek", "Suricata", "TheHive", "MISP"]
funcion: ["detectar"]
destacado: false
borrador: true
---

Este archivo no es un lab. Es andamiaje para revisar el diseño del sitio en
`npm run dev`, y no describe ningún trabajo real: las herramientas del
frontmatter están puestas solo para llegar a seis y no significan nada.

Se borra junto con el resto del andamiaje cuando termine la V2, con
`rm src/content/labs/andamiaje-*.md`. Lleva `borrador: true`, así que no
llega a producción ni genera página.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Portafolio de ciberseguridad defensiva. Astro estático, desplegado en GitHub Pages en https://achibury.github.io
Sitio de usuario: NO lleva `base` en astro.config.mjs.

## Contexto del autor

Estudiante de ingeniería en ciberseguridad, Chile. Perfil blue team.
NO soy desarrollador web: explica las decisiones de código y no asumas conocimiento de frontend.

## Estado actual

El sitio está **publicado e indexable** en https://achibury.github.io.
El `noindex` que acompañó todo el desarrollo ya se quitó.

Hay **un lab real publicado**: `hardening-router-cisco` — auditoría y
hardening de un router Cisco, `categoria: infraestructura`. Va marcado
`destacado: true`, la primera aplicación real de ese campo: lo fija en la
home sin depender de que siga siendo el más reciente.

El header lleva el **monograma BA** en vez del nombre en texto. Todo lo
de la marca está en la sección "La marca" (`docs/marca.md`); la fuente única es
`src/lib/logo.ts`.

`npm run build` genera **5 páginas** (home, `/labs`, el detalle del lab,
`/sobre-mi` y `404`) más `sitemap-index.xml`.

**`/herramientas` ya no existe.** Era un placeholder que decía "Sección
en construcción" y estaba publicado e indexable. Se borró entero: la
página, su enlace en el menú del header y las referencias de este
archivo. El sitemap no necesitó tocarse — se arma leyendo `dist/`, así
que la URL desapareció sola.

En `src/content/labs/` hay **otros dos `.md`**, los dos con
`borrador: true`, los dos **fuera de producción** y ninguno genera
página: el de PowerShell/Sigma y el de Volatility. Son **contenido de
ejemplo ficticio** y se conservan como referencia de formato — así se ve
un lab terminado. Si el conteo de páginas no te cuadra, esa es la razón;
no está roto.

Los labs largos llevan **tabla de contenidos**: barra a la derecha en
escritorio, desplegable en móvil. Se enciende sola según el largo del
lab, así que hoy la tiene el de hardening y ninguno de los dos
borradores. Ver "Tabla de contenidos de un lab" (`docs/tabla-de-contenidos.md`).

## Pendientes

Cosas abiertas a hoy, verificadas contra el código:

- **No existe `public/cv.pdf`**, así que la sección del currículum de
  `/sobre-mi` no se genera. Es a propósito: mejor sin sección que con un
  botón roto. Se activa sola al dejar el PDF ahí.
- **`hayCertificaciones` está en `false`** en `sobre-mi.astro`, porque
  todavía no hay ninguna. El markup ya está escrito esperando.
- ~~**V2 — el header envuelve en dos filas a 360px.**~~ **RESUELTO**, y
  sin tocar el header: lo arregló borrar `/herramientas`. Medido con las
  métricas reales de Segoe UI a 14px en peso 600, que es el del menú:

  | | Antes (`Labs` · `Herramientas` · `Sobre mí`) | Ahora (`Labs` · `Sobre mí`) |
  | --- | --- | --- |
  | Menú | 210,91px | **105,45px** |
  | Header entero (logo 40 + hueco 32 + menú) | 282,91px | **177,45px** |
  | Holgura sobre los 312px disponibles | 29,09px | **134,55px** |

  Los 312px salen de 360 menos 24 de relleno por lado. Anchos medidos de
  cada enlace: `Labs` 28,62 · `Sobre mí` 56,82 · `Herramientas` 85,46
  (el que se fue), más 20px de hueco entre enlaces.

  Lo que estaba anotado no era que el header se rompiera — entraba en
  una fila por 29px — sino que **el margen era tan fino que cualquier
  enlace nuevo lo rompía**. Con 134,55px de holgura ese riesgo se fue: un
  enlace nuevo tendría que medir más de 115px de texto para volver a
  partirlo, y `Herramientas`, el más largo que hubo, medía 85. El menú
  colapsable **deja de ser necesario** para este problema.

  **Hubo un tercer enlace, `Contacto`, y se revirtió. No lo repongas.**
  Llegó a estar apuntando a `/sobre-mi/#contacto` y el menú medía 182,96px
  con 57,04px de holgura, o sea que **entraba de sobra**: no se quitó por
  ancho, así que no busques acá el motivo. Está en Pendientes, en
  "encontrar el contacto".

- **Nadie encuentra el contacto, y las dos salidas obvias ya fallaron.**
  El bloque de correo + LinkedIn vive al final de `/sobre-mi`, que es una
  página que hay que buscar y después bajar entera. Se intentaron dos
  cosas y **las dos se descartaron después de verlas montadas**:

  1. **Un enlace `Contacto` en el menú del header**, apuntando a
     `/sobre-mi/#contacto`. Entraba de sobra en el ancho (57px de
     holgura a 360px), pero la etiqueta y el destino no coincidían:
     decías "Contacto" y caías en una página titulada "Sobre mí", con el
     menú marcando "Sobre mí" como la sección activa.
  2. **Mover el bloque entero al pie de página**, que sale en las 5.
     Aligerado para no competir con el contenido (sin marco, subrayado
     como señal), quedó tan discreto que se volvió invisible.

  Queda el ancla `id="contacto"` en la sección, que no molesta y sirve
  para enlazar directo. **El problema sigue abierto**: no hay una tercera
  idea decidida. Lo que ya se sabe es que no se resuelve ni con una
  etiqueta en el menú que mienta sobre su destino, ni haciendo el bloque
  más discreto.

- **El filtro de `/labs` está decidido pero NO construido, y su análisis
  salió de este archivo.** Eran 216 líneas describiendo algo que no
  existe en el código, leídas en cada sesión. Están enteras en
  `notas/filtros-labs.md`: qué lógica, qué controles, cómo degrada sin
  JavaScript, y las **dos cosas que hay que resolver primero** — que
  `funcion` sea opcional en el schema, y que `categoria` y `funcion` se
  solapen. **Se retoma al sexto lab publicado**, no antes; hoy hay uno.
  No está en `docs/` a propósito: no corresponde leerlo "antes de tocar
  el área" mientras el área no existe.
  Ojo: `notas/` está en `.gitignore`, así que ese archivo **no se
  versiona**. Si se pierde la copia de trabajo, el análisis sigue en el
  historial, dentro de la versión de `CLAUDE.md` anterior a la división:
  `git log --oneline -- CLAUDE.md` y después `git show <commit>:CLAUDE.md`.

No hay un próximo lab decidido en este archivo. Si vas a escribir uno,
pregúntame cuál en vez de asumir: hubo un plan viejo de hacer uno de
segmentación de red en PNETLab que **no** fue el que terminó saliendo
primero.

## Entorno

- Node local: 24.x
- Node en CI: fijado a 22 en `.github/workflows/deploy.yml`
- `package.json` declara `engines.node: ">=22.12.0"`
- Si el build pasa local pero falla en Actions, revisar primero paridad de versiones de Node

## Comandos

```
npm install              # instalar dependencias
astro dev --background   # levantar el servidor de desarrollo (ver abajo)
npm run build            # compilar el sitio de producción a ./dist/
npm run preview          # previsualizar el build de producción en local

node scripts/generar-logo.mjs   # regenerar favicon.svg y logo-circulo.svg
node scripts/generar-og.mjs     # regenerar og.png
```

Los dos `generar-*` se corren **a mano** y solo cuando cambia lo que
dibujan; ver "La marca" (`docs/marca.md`).

No hay suite de tests ni linter configurados en este repo. `npm run build` es la
verificación real: valida el frontmatter de todos los labs contra el schema Zod
y falla si algo no cuadra. El workflow de despliegue tampoco corre nada más:
el build es la única barrera antes de publicar.

`npm run astro check` (chequeo de tipos) necesita instalar antes `@astrojs/check`
y `typescript`, que todavía no están instalados.

Al iniciar el servidor de desarrollo, usar modo background:

```
astro dev --background
```

Gestionar el servidor en background con `astro dev stop`, `astro dev status` y `astro dev logs`.

## Reglas

- Antes de editar cualquier archivo de `src/`, mira el índice de
  "Archivos de detalle" más abajo y lee el que cubre esa área. No
  adivines por el nombre del archivo: casi todo lo que en este proyecto
  parece redundante o simplificable está documentado, y el build no
  avisa cuando lo rompes.
- Antes de dar por bueno un cambio, correr `npm run build`
- Al cambiar CUALQUIER color, verificar contraste mínimo **4.5:1** del texto
  contra su fondo, en modo claro **y** oscuro. Los valores medidos están
  anotados en los comentarios de `global.css`; si cambias un token, recalcula
  y actualiza el comentario. No estimes a ojo.
- Nunca commitear capturas sin que yo confirme que están sanitizadas
- Español de Chile. Imperativo con tú ("reemplaza", "revisa"),
  nunca voseo rioplatense ("reemplazá", "revisá").

## Archivos de detalle

Este archivo tiene lo que hace falta en **toda** sesión. El resto está en
`docs/`, y hay que **leerlo antes de tocar el área que cubre**, no
después de romper algo. Son decisiones medidas, no preferencias: casi
todas se tomaron descartando la alternativa obvia, y el motivo está ahí.

| Antes de… | Lee |
| --- | --- |
| editar cualquier CSS del sitio o `astro.config.mjs` | `docs/no-tocar.md` |
| tocar colores, tipografía, espaciado, `global.css` o el resaltado de código | `docs/sistema-de-diseno.md` |
| tocar `toc.ts`, `TablaContenidos.astro` o la rejilla de `Lab.astro` | `docs/tabla-de-contenidos.md` |
| escribir o editar un lab, su frontmatter, la taxonomía o sus capturas | `docs/escribir-labs.md` |
| tocar `logo.ts`, `Logo.astro`, el favicon o `og.png` | `docs/marca.md` |
| tocar `Base.astro`, `sobre-mi.astro`, la 404, el `<head>` o el JSON-LD | `docs/paginas-y-seo.md` |

Las rutas van en comillas invertidas y **nunca con `@` adelante**. Un
`@docs/archivo.md` en este archivo hace que Claude Code lo incruste
automáticamente en cada sesión, que es exactamente lo que esta división
existe para evitar.

Fuera del índice, a propósito: `notas/filtros-labs.md` — ver Pendientes.

## NO TOCAR — la lista

Trece cosas que **parecen** redundantes o simplificables y no lo son. En
los trece casos quitarlas rompe algo **sin que el build se queje**: el
daño solo se ve mirando la página.

Acá están solo los títulos, como alarma. El motivo, la medición y el "ya
pasó una vez" de cada uno están en **`docs/no-tocar.md`**, y hay que leer
el punto entero antes de tocar lo que nombra.

 1. El selector `:is()` de `Lab.astro`
 2. `wrap: false` en `shikiConfig` (astro.config.mjs)
 3. `pre.astro-code code { font-size: 1em }`
 4. La barra de scroll forzada a visible
 5. El correo partido de `sobre-mi.astro`
 6. Las seis propiedades del código en línea
 7. `margin-inline: 0` en el blockquote de un lab
 8. `--toc-ancho: 288px` (y no 240, y tampoco 256)
 9. `minmax(0, 1fr)` y `align-items: start` en la rejilla del lab
10. El `rootMargin` gigante del scroll-spy
11. La cabecera del lab NO cruza las dos columnas
12. La línea del h2 usa `--chip-borde`, no `--borde`
13. El relleno de 16px de la tabla de contenidos

## Convenciones

- Todo el contenido visible en español
- Labs en `src/content/labs/` como Markdown
- Astro puro, sin frameworks de UI innecesarios
- Commits en español, descriptivos
- Ningún componente debe llevar `font-size` en píxeles: todos salen de la
  escala tipográfica de `global.css`

## Arquitectura

- Astro 7, sin integraciones de framework instaladas. Prácticamente cero
  JavaScript en el cliente: **cero archivos `.js` emitidos**, cero
  dependencias, y dos `<script is:inline>` que son todo lo que corre en el
  navegador:
  - `sobre-mi.astro` — arma el enlace `mailto:` del correo para no
    publicarlo en el HTML estático, y destapa el botón de copiar. Va
    **solo en esa página**: se probó moverlo al pie, o sea a las 5, y se
    revirtió (ver Pendientes).
  - `Lab.astro` — marca la sección que se está leyendo en la tabla de
    contenidos, con un `IntersectionObserver`. Es la única parte de la
    barra que necesita JavaScript; el resto funciona sin él. Va solo en
    las páginas de lab.

  Los dos van en línea y no en un archivo aparte a propósito: son de
  decenas de líneas, cada uno vive en una sola página, y una petición
  HTTP más pesaría más que el código.
- `src/pages/` usa routing basado en archivos: cada archivo es una ruta.
  `labs/[...id].astro` es la ruta dinámica que genera una página por lab.
- `src/lib/labs.ts` es el **único** punto de lectura de la colección. Ahí vive el
  filtrado de borradores y el orden por fecha; no duplicar esa lógica en las páginas.
- `src/lib/toc.ts` decide si un lab lleva tabla de contenidos y cuáles
  encabezados entran. Va aparte de `labs.ts` porque **no importa
  `astro:content`**: es aritmética pura y así se puede verificar con
  `node` sin levantar el sitio. Ver "Tabla de contenidos de un lab" (`docs/tabla-de-contenidos.md`).
- `src/content.config.ts` define la colección `labs` con la Content Layer API de
  Astro 5+ (`loader: glob(...)`), no la carpeta mágica de versiones viejas.
- `src/styles/global.css` concentra los tokens de diseño arriba del archivo.
- `public/` contiene assets estáticos servidos tal cual, **sin pasar por
  el filtro de borradores ni por la optimización de imágenes**. `favicon.svg`,
  `logo-circulo.svg` y `og.png` son **generados** — ver "La marca" (`docs/marca.md`) — y se
  commitean. El `.ico` se borró a propósito para no mantener dos archivos
  sincronizados, y todos los navegadores en uso soportan favicons en SVG.
  Las capturas de los labs **no** van acá: ver "Capturas e imágenes" (`docs/escribir-labs.md`).
- `src/assets/labs/<slug>/` guarda las capturas de cada lab, para que
  Astro las procese en el build.
- `astro.config.mjs` define `site: 'https://achibury.github.io'`, necesario para que las URLs absolutas salgan bien en GitHub Pages. Al ser sitio de usuario (no de proyecto), no lleva `base`.
- `tsconfig.json` extiende el preset `strict` de Astro.
- Despliegue automático: `.github/workflows/deploy.yml` compila con `withastro/action@v3` (Node 22) y publica con `actions/deploy-pages` en cada push a `main`.
- `AGENTS.md` es un hardlink a este archivo: editarlo en su sitio (no reemplazarlo) para que ambos sigan sincronizados. `Write`, `Edit` y `sed -i` rompen el enlace, los tres por el mismo motivo: escriben un archivo nuevo y lo renombran encima. Hay que truncar el existente y escribir encima (`cat nuevo.md > CLAUDE.md`). El enlace se rompe en silencio: los dos archivos quedan y simplemente dejan de ser el mismo. Se comprueba con `stat -c %i CLAUDE.md AGENTS.md`, que debe dar el mismo inodo.

## Documentación

Documentación completa: https://docs.astro.build

Consultar estas guías antes de trabajar en tareas relacionadas:

- [Agregar páginas, rutas dinámicas o middleware](https://docs.astro.build/en/guides/routing/)
- [Trabajar con componentes Astro](https://docs.astro.build/en/basics/astro-components/)
- [Usar componentes React, Vue, Svelte u otros frameworks](https://docs.astro.build/en/guides/framework-components/)
- [Agregar o gestionar contenido](https://docs.astro.build/en/guides/content-collections/)
- [Agregar estilos o usar Tailwind](https://docs.astro.build/en/guides/styling/)
- [Soportar múltiples idiomas](https://docs.astro.build/en/guides/internationalization/)

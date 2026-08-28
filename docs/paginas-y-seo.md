# Páginas, indexación y metadatos

> Archivo de detalle de [`CLAUDE.md`](../CLAUDE.md) (que es el mismo
> archivo que `AGENTS.md`).
>
> **Léelo antes de:** tocar `Base.astro`, `sobre-mi.astro`, la 404, el
> `<head>`, el JSON-LD, el sitemap o `robots.txt`.
>
> Incluye las limitaciones conocidas del sitio, que están acá y no en
> Pendientes a propósito: son decisiones evaluadas y postergadas con
> motivo, no tareas olvidadas. Antes de "arreglarlas", lee por qué no
> están arregladas.

## Páginas y layouts

- `src/layouts/Base.astro` envuelve todas las páginas. Título:
  `${titulo} · Benjamin Achibury`.

  **El sitio ya es indexable.** El `<meta name="robots" content="noindex">`
  que estuvo durante todo el desarrollo se quitó al publicar. Si alguna vez
  hace falta volver a esconderlo (una reescritura grande, por ejemplo), se
  agrega de nuevo acá y además hay que revisar `public/robots.txt` y el
  sitemap, que hoy invitan a indexar.

  Arma también los metadatos de compartido: `canonical`, Open Graph y
  Twitter cards. Todos toman título y descripción de las props de cada
  página, así que cada lab comparte su propio título y resumen; no hay
  valores fijos que actualizar. La URL sale de
  `new URL(Astro.url.pathname, Astro.site)`, o sea que si cambia el
  dominio se cambia en `astro.config.mjs` y listo.

  La `og:image` es fija para todo el sitio: `public/og.png` (1200×630),
  referenciada con `new URL('/og.png', Astro.site)`. Tiene que ser URL
  absoluta porque LinkedIn y compañía leen la etiqueta desde sus propios
  servidores, donde `/og.png` no significa nada.
- `src/layouts/Lab.astro` arma la cabecera del lab y estila el HTML que sale
  del Markdown con `:global()` acotado a `.prosa`. También monta la rejilla
  de dos columnas cuando el lab lleva tabla de contenidos, y lleva el
  script que marca la sección actual.

  **Los rótulos de la cabecera ("Herramientas", "MITRE ATT&CK",
  "Función") son `<p class="titulo-seccion">`, NO encabezados.** Antes
  eran `h2` y eso rompía dos cosas a la vez: no salen de `render()`, así
  que la tabla de contenidos no podía listarlos, y quien navegara por
  encabezados con lector de pantalla encontraba tres `h2` que el índice no
  tenía. Como además van *antes* del primer `h2` del contenido, bajarlos a
  `h3` habría dejado un salto `h1 → h3`, que es su propio problema.

  Sacarlos del esquema de encabezados es lo correcto: el esquema describe
  la estructura del contenido, que es exactamente lo que lista el índice.
  **Ahora los `h2` del documento y los ítems del índice son los mismos
  ocho**, y esa es la invariante que conviene no perder. La asociación
  entre el rótulo y su lista de chips la sostiene un `aria-labelledby` en
  el `<ul>`, así que el lector de pantalla sigue anunciando
  "Herramientas, lista, 2 elementos".
- `src/pages/404.astro` compila a `dist/404.html`, que GitHub Pages sirve
  solo ante cualquier URL equivocada. En dev se ve entrando a `/404`.
- `src/pages/sobre-mi.astro` tiene **dos banderas que se evalúan en el build**:
  - `hayCV`: comprueba con `existsSync` si existe `public/cv.pdf`. Si no
    está, la sección entera del currículum no se genera, en vez de publicar
    un botón que lleva a un 404. Para activarla basta con dejar el PDF ahí.
  - `hayCertificaciones`: booleano manual, hoy en `false` porque todavía no
    hay ninguna. El markup ya está escrito esperando; el comentario del
    archivo tiene los pasos para reactivarla.

  **Ya no queda texto de relleno en esa página**: la presentación son
  cuatro párrafos reales y los comentarios `REEMPLAZAR` se fueron con
  ellos. Si vuelves a dejar uno, que sea `{/* ... */}` de Astro, que
  queda en el código fuente y **no** se publica.

  **No hay sección "Áreas de interés", y es a propósito.** La había, con
  una lista escrita a mano, y se quitó porque prometía áreas que los labs
  ya declaran con evidencia (`categoria`, `herramientas` y `funcion`
  del frontmatter). El hueco quedó con un comentario que explica cómo
  regenerarla desde los labs publicados si algún día vuelve. No la
  reintroduzcas escrita a mano.

## Limitaciones conocidas

**Los bloques de código no tienen nombre accesible.** Llevan `tabindex="0"`,
así que son alcanzables con el teclado, pero quien use lector de pantalla
llega a una parada de tabulación muda: no se le anuncia qué es ni por qué
puede desplazarla. Falta un `role="region"` con `aria-label`.

Sobre cómo resolverlo, verificado contra el código de `astro@7.2.3` instalado
y contra la documentación oficial:

- Desde Astro 7 el procesador de Markdown por defecto es **Sätteri**
  (`@astrojs/markdown-satteri`), no unified.
- Por eso `markdown.rehypePlugins` y `markdown.remarkPlugins` ya no funcionan
  sin instalar `@astrojs/markdown-remark`. Se decidió no meter esa dependencia.
- El camino nativo es un **`hastPlugin`** pasado a `satteri()` en
  `markdown.processor`. `@astrojs/markdown-satteri` ya viene con Astro, aunque
  para importarlo en `astro.config.mjs` conviene declararlo en `package.json`.

No está implementado. Queda como decisión pendiente, no como algo cerrado.

**La imagen de Open Graph es una sola para todo el sitio.** Cualquier
página que se comparta muestra la misma tarjeta, con el nombre y la línea
de posicionamiento; no dice de qué lab se trata. Generar una por lab, con
el título dibujado encima, se evaluó y se descartó: pide una dependencia
de dibujo y una ruta que la sirva, y para un portafolio de este tamaño no
compensa. Queda como mejora posible, no como deuda.

## Indexación

El sitio está **publicado e indexable**. Tres piezas que trabajan juntas:

| Pieza | Dónde | Qué hace |
| --- | --- | --- |
| `canonical` + Open Graph | `src/layouts/Base.astro` | URL oficial de cada página y tarjeta de vista previa |
| `sitemap-index.xml` | lo genera `@astrojs/sitemap` | lista de URLs para los buscadores |
| `robots.txt` | `public/robots.txt` | permite todo y apunta al sitemap |

**El sitemap no necesita filtrar borradores.** Solo lista páginas que
existen en `dist/`, y un lab en borrador no genera página, así que queda
fuera solo. Lo que sí lleva filtro explícito en `astro.config.mjs` es la
404: es una respuesta de error, no contenido, y no corresponde en un mapa
del sitio.

**Si algún día vuelve el `noindex`**, hay que tocar las tres piezas, no
solo el meta: un sitemap que anuncia URLs mientras el HTML pide no
indexarlas es una contradicción que los buscadores resuelven mal.

### Datos estructurados (JSON-LD)

Dos bloques `application/ld+json`, y solo dos:

| Página | `@type` | De dónde salen los datos |
| --- | --- | --- |
| Cada lab publicado | `TechArticle` | el frontmatter del lab |
| `/sobre-mi` | `Person` | `src/lib/sitio.ts` |

Las piezas: `src/lib/sitio.ts` (constantes `AUTOR` y `PERFILES`),
`src/components/DatosEstructurados.astro` (serializa y emite) y la prop
`datosEstructurados` de `Base.astro`, que lo pone en el `<head>`. Quien
conoce los datos arma el objeto; el componente solo lo escribe.

**No agrega JavaScript al cliente.** Un `type="application/ld+json"` es
datos inertes: el navegador no ejecuta nada de lo que hay dentro.

**Expectativa realista:** esto **no** sube el ranking. Hace que las
páginas sean elegibles para que el buscador muestre fecha y autor, y le
da esos datos explícitos en vez de que los adivine.

Cuatro cosas que no son obvias:

- **El correo NO va nunca en el JSON-LD.** La página de contacto parte la
  dirección en dos con un `<span>` justamente para que no la barran los
  recolectores (ver "NO TOCAR" punto 5, `docs/no-tocar.md`). Ponerla en un JSON-LD la
  entregaría entera y en texto plano, anulando esa protección completa.
  El `Person` queda más delgado por eso, y está bien así.
- **Los borradores no emiten nada.** En producción no generan página, pero
  en `npm run dev` sí se muestran, así que `Lab.astro` pasa `undefined`
  cuando `borrador` es `true`.
- **Las URLs son absolutas**, armadas con `Astro.site` igual que el
  canonical. Los buscadores leen el JSON-LD fuera del contexto de la
  página y una ruta relativa no significa nada ahí.
- **El componente escapa el signo menor que** como `\u003c`.
  `JSON.stringify` no lo escapa, y un texto del frontmatter que
  contuviera la secuencia de cierre de un script cerraría el bloque antes
  de tiempo y volcaría el resto como HTML.

El `Person` lleva `jobTitle`, `description`, `alumniOf` (el instituto,
como `EducationalOrganization`) y `address` con ciudad y país. La
`description` es un resumen del primer párrafo de la presentación,
**escrito a mano en el objeto**, no derivado del HTML: el párrafo puede
crecer o partirse en dos y la descripción tiene que seguir siendo una
frase. Si editas ese párrafo, revisa el campo.

Campos que **faltan por falta de dato**, no por olvido: el `Person` no
lleva `image` porque no hay foto en el repo. Y el `image` del
`TechArticle` es el `og.png` genérico del sitio, no una imagen del lab:
es honesto (es la imagen social de esa página) pero no ilustra el
contenido.

**"Enforce HTTPS" está activado** en Settings → Pages del repositorio
(confirmado). GitHub Pages no deja configurar cabeceras HTTP, así que esa
opción es la única palanca de transporte que hay; el resto —
`X-Frame-Options`, `Permissions-Policy`, `frame-ancestors` de CSP — no se
puede desde un sitio estático en Pages, ni siquiera por `<meta>`. Para un
sitio sin formularios, sin cookies y sin JavaScript de terceros, el riesgo
real de esa ausencia es muy bajo. No propongas soluciones que Pages no
soporta.

### La imagen de vista previa

`public/og.png` (1200×630) se genera con:

```
node scripts/generar-og.mjs
```

El script usa `sharp`, que ya viene con Astro para optimizar imágenes, o
sea que no agrega dependencias. Los colores salen de la paleta del modo
oscuro de `global.css`. Hay que volver a correrlo si cambia el nombre o la
línea de posicionamiento; el archivo generado se commitea.


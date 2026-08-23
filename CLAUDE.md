# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Portafolio de ciberseguridad defensiva. Astro estático, desplegado en GitHub Pages en https://achibury.github.io
Sitio de usuario: NO lleva `base` en astro.config.mjs.

## Contexto del autor

Estudiante de ingeniería en ciberseguridad, Chile. Perfil blue team.
NO soy desarrollador web: explica las decisiones de código y no asumas conocimiento de frontend.

## Estado actual

El sitio **publica cero labs**. Los dos `.md` que hay en `src/content/labs/`
son contenido de ejemplo ficticio, marcados con `borrador: true`, y se
conservan como referencia de formato.

Consecuencias que NO son errores:

- `npm run build` genera **5 páginas**, no 7: home, `/labs`, `/herramientas`,
  `/sobre-mi` y `404`. Las páginas de detalle de los labs no se generan.
- La home y `/labs` muestran el estado vacío "Todavía no hay labs publicados".
- En `npm run dev` los borradores **sí** se ven, para poder previsualizarlos.

Si ves listados vacíos, el sitio está bien. No lo "arregles".

## Próximo paso

Escribir el primer lab real: **segmentación de red en PNETLab**,
`categoria: infraestructura`.

`PNETLab` ya está en `taxonomia.ts`, así que no hay que agregarlo. Si el
lab usa alguna herramienta más que todavía no esté en esa lista, hay que
sumarla ahí o el build falla (ver "Colección de labs").

Al terminarlo, quitarle `borrador: true`.

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
```

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

- Antes de dar por bueno un cambio, correr `npm run build`
- Al cambiar CUALQUIER color, verificar contraste mínimo **4.5:1** del texto
  contra su fondo, en modo claro **y** oscuro. Los valores medidos están
  anotados en los comentarios de `global.css`; si cambias un token, recalcula
  y actualiza el comentario. No estimes a ojo.
- Nunca commitear capturas sin que yo confirme que están sanitizadas
- Español de Chile. Imperativo con tú ("reemplaza", "revisa"),
  nunca voseo rioplatense ("reemplazá", "revisá").

## NO TOCAR

Cinco cosas que **parecen** redundantes o simplificables y no lo son. Cada
una se ve como código que sobra; quitarla rompe algo, y en cuatro de los
cinco casos el build sigue pasando y el daño es invisible.

### 1. El selector `:is()` de `Lab.astro`

```css
.prosa :is(h2, h3) + :is(p, ul, ol, pre, table, blockquote, figure, hr) {
  margin-top: 0;
}
```

**Parece** que se puede escribir más corto como `.prosa :is(h2, h3) + *`.

**No.** Esa versión vale `(0,2,1)` de especificidad, exactamente lo mismo
que `.prosa p`, `.prosa pre` y `.prosa table`, que llevan `margin-block` y
por lo tanto también fijan el margen de arriba. Empatan, y gana la que esté
declarada después: las otras. Ya pasó una vez — el hueco bajo un h3 seguido
de un bloque de código quedaba en 24px en vez de 8px y el encabezado
flotaba entre dos secciones.

Nombrar los dos lados sube el selector a `(0,2,2)` y gana sin depender del
orden. El build no avisa: solo se ve peor.

### 2. `wrap: false` en `shikiConfig` (astro.config.mjs)

**Parece** que envolver las líneas largas sería más amable en móvil.

**No.** Con `wrap: true`, Shiki inyecta `white-space: pre-wrap` y cualquier
salida tabular se parte en dos renglones: la cabecera de un `pslist` deja de
alinearse con la fila de guiones y la tabla se vuelve ilegible. Se prefiere
conservar el formato y que el usuario deslice. El scroll horizontal está
resuelto en `global.css`.

### 3. `pre.astro-code code { font-size: 1em }`

**Parece** una regla que no hace nada, porque el `<pre>` ya define el tamaño.

**No.** El `<code>` va *dentro* del `<pre>`, y la regla `code { font-size:
var(--t-mono) }` también le aplica. Sin el `1em`, el factor `0.9` se aplica
dos veces: `16 × 0.9 × 0.9 = 12.9px` en lugar de `14.4px`. Fue un bug real
que hacía ver todo el código notoriamente más chico de lo previsto.

### 4. La barra de scroll forzada a visible

```css
pre.astro-code::-webkit-scrollbar { height: 10px; }
pre.astro-code { scrollbar-width: thin; scrollbar-color: ...; }
```

**Parece** que el navegador ya dibuja la barra solo.

**No.** macOS e iOS usan barras superpuestas que permanecen **ocultas** hasta
que alguien desliza. Como los bloques no envuelven (ver punto 2), sin barra
visible no queda ninguna señal de que hay más contenido a la derecha: el
usuario ve una línea cortada y asume que eso es todo.

### 5. El correo partido de `sobre-mi.astro`

```html
<span class="correo" data-correo>benjamin.achibury<span>&#64;</span>protonmail.com</span>
```

**Parece** un `<span>` anidado sin sentido que se puede reemplazar por un
`<a href="mailto:...">` normal.

**No.** Es deliberado, y son tres piezas que dependen entre sí:

- el `<span>` interno parte la cadena, así que la dirección completa **no
  aparece contigua** en el código fuente;
- `&#64;` evita que la arroba literal esté en el HTML;
- el `<script is:inline>` del final de la página arma el `mailto:` en el
  navegador leyendo el `textContent`.

Si el JavaScript no corre, el correo igual se ve y se puede copiar. Reemplazarlo
por un `mailto:` estático anula la protección contra recolectores de spam,
que es justamente lo que buscan primero.

**Alcance real, para no exagerarlo:** frena a los recolectores que buscan
`href="mailto:"` o aplican una expresión regular sobre el HTML. No frena a
uno que renderice la página y lea el DOM. Es un filtro, no un blindaje.

## Convenciones

- Todo el contenido visible en español
- Labs en `src/content/labs/` como Markdown
- Astro puro, sin frameworks de UI innecesarios
- Commits en español, descriptivos
- Ningún componente debe llevar `font-size` en píxeles: todos salen de la
  escala tipográfica de `global.css`

## Colección de labs

### Schema (`src/content.config.ts`)

El frontmatter se valida con Zod. Un campo mal escrito **falla el build**
con un mensaje claro; es a propósito, es la red de seguridad.

| Campo | Tipo | Notas |
| --- | --- | --- |
| `titulo` | string | obligatorio |
| `resumen` | string | obligatorio; se usa como `<meta description>` |
| `fecha` | date | `z.coerce.date()`, se escribe `2026-03-14` |
| `categoria` | enum | obligatorio, ver abajo |
| `herramientas` | string[] | validado contra `taxonomia.ts`, por defecto `[]` |
| `mitre_attack` | string[] | **opcional** |
| `funcion` | enum[] | **opcional**, NIST CSF 2.0 |
| `borrador` | boolean | por defecto `false` |

**Categorías** (las seis, no inventar otras):
`infraestructura` · `deteccion` · `analisis` · `herramienta` · `cumplimiento` · `notas`

Se escriben en minúscula y sin tildes. Lo que se muestra en pantalla sale
del mapa `ETIQUETAS_CATEGORIA` en `src/lib/labs.ts`, que es un
`Record<Lab['data']['categoria'], string>`: si agregas una categoría al
schema y olvidas su etiqueta, TypeScript se queja.

**`mitre_attack` es opcional a propósito.** Usarlo únicamente en labs de
categoría `deteccion` o `analisis`, y solo con las técnicas que el lab
realmente trabaja. Listar técnicas que apenas se mencionan infla el mapeo
y le quita valor al que sí corresponde. Si no se declara, la fila no aparece.

**`funcion`** son las funciones del NIST CSF 2.0:
`identificar` · `proteger` · `detectar` · `responder` · `recuperar`

El marco tiene seis; falta *gobernar* (GOVERN) **a propósito**, porque es una
función de gobernanza organizacional y no algo que se demuestre en un
laboratorio técnico. No la agregues "porque falta".

### Taxonomía (`src/content/taxonomia.ts`)

Vocabulario controlado. `herramientas` se valida contra la lista `HERRAMIENTAS`
y **el build falla** si aparece algo que no está, mostrando todas las opciones
válidas. Existe para que la misma herramienta no termine escrita de varias
formas ("Volatility", "Volatility3", "volatility 3") y cada variante cuente
como una etiqueta distinta.

Para usar una herramienta nueva hay que agregarla ahí primero, respetando
cómo se escribe oficialmente. **Es el único lugar.**

La lista va en **orden alfabético ignorando mayúsculas**. No es estética: con
la lista ordenada, al ir a agregar algo ves de inmediato si ya estaba. Sin
orden se cuelan duplicados — pasó con `Wireshark`, que llegó a estar dos veces.

### Borradores

`borrador: true` se comporta distinto según el entorno, y eso está
concentrado en `src/lib/labs.ts`:

- **`npm run dev`**: se muestran, para poder escribirlos y previsualizarlos.
- **`npm run build`**: se filtran siempre, y además **no se genera su página
  de detalle**, así que no quedan accesibles ni entrando por la URL directa.

Esa regla tiene que aplicarse en tres lugares (home, listado y ruta dinámica).
Está escrita **una sola vez** en `getLabsPublicados()`. No la dupliques en las
páginas: la copia se desactualiza y se te publica un borrador sin querer.

## Capturas e imágenes de un lab

### Cuándo va imagen y cuándo va bloque de código

**Una captura de terminal que es solo texto va como bloque de código, no
como imagen.** Siempre.

Un `nmap`, un `show running-config`, un log: pegarlos como texto en un
bloque ```` ``` ```` es mejor en todo. Se puede copiar, buscar con Ctrl+F,
lo lee un lector de pantalla, pesa mil veces menos, escala en cualquier
pantalla y no queda borroso al hacer zoom. Una captura de eso mismo no
aporta nada que el texto no tenga, y encima obliga a revisarla por
separado antes de publicar (ahí fue donde casi se filtra un hash real:
el texto estaba redactado y la imagen no).

Las imágenes se reservan para lo que el texto **no** puede transmitir:

- diagramas de topología
- interfaces gráficas (Kibana, Wireshark, la consola de un EDR)
- cualquier cosa donde la disposición visual sea el contenido

### Dónde van

En `src/assets/labs/<slug-del-lab>/`, **no** en `public/`. Se referencian
con ruta **relativa** desde el `.md`:

```markdown
![Texto alternativo](../../assets/labs/mi-lab/01-topologia.png)
```

Al estar bajo `src/`, Astro las procesa durante el build y sale gratis:
conversión a WebP (-41% de peso medido), `width` y `height` en el HTML
(sin salto de maquetación al cargar), `loading="lazy"` y nombre con hash
de contenido.

Con ruta absoluta a `public/` no pasa **nada** de eso: el archivo se copia
tal cual, sin optimizar y sin dimensiones.

Por qué `src/assets/` y no dentro de `src/content/labs/`: el loader de la
colección hace glob de `**/*.md` de forma recursiva sobre esa carpeta. Si
las imágenes viven ahí y algún día cae un `README.md` o una nota suelta
en la carpeta de un lab, ese archivo se convierte en una entrada de la
colección y rompe el build. Manteniendo `src/content/labs/` con puros
`.md` de labs, ese problema no existe.

### Las capturas de un lab en borrador NO entran al repo

Mientras el lab tenga `borrador: true`, sus capturas se quedan **fuera
del repositorio** (por ejemplo en `notas/`, que está en `.gitignore`).
Se mueven a `src/assets/labs/<slug>/` recién al publicarlo.

No es una preferencia de orden, es lo único que funciona. Se probó y
quedó descartado lo demás:

- Bajo `public/`, el archivo se copia a `dist/` siempre, sin pasar por el
  filtro de borradores, y queda en una URL adivinable.
- Bajo `src/`, Vite igual emite el asset a `dist/_astro/` aunque la página
  del lab no se genere. Mejora (el nombre lleva hash y no es enumerable)
  pero no lo impide.
- `deferRender: true` en el loader **tampoco** lo impide. Se probó.

Y sobre todo: el repositorio es público. Una captura commiteada es
pública desde el commit, esté o no en `dist/`. El momento de revisarla
por datos sensibles es **antes** de `git add`, no antes de publicar.

## Sistema de diseño

Todo vive en el `:root` de `src/styles/global.css`. Reestilizar debería ser
mayormente cambiar ese bloque.

### Anchos

Dos variables, tres comportamientos:

- `--ancho-prosa: 70ch` — texto corrido. La unidad `ch` es el ancho del
  carácter cero, así que dice literalmente "70 caracteres por línea".
- `--ancho-contenedor: 1120px` — header, footer, listados.
- Los bloques anchos (`pre`, `img`, `table`) **no** están en la regla de
  medida de lectura, así que quedan libres y llegan hasta el contenedor.

La prosa va alineada a la izquierda, no centrada, para que su borde coincida
con el del header y el footer. La excepción es `/sobre-mi`, que usa
`.contenedor--centrado` para angostar el bloque y centrarlo.

### Tipografía

Escala `--t-xs` … `--t-2xl` (12 / 14 / 16 / 18 / 21 / 28 / 36 px) más
`--t-mono: 0.9em` para código.

Los saltos son amplios a propósito: si h2, h3 y cuerpo se diferencian poco,
el ojo no los lee como tres niveles distintos sino como variaciones del mismo.

### Jerarquía por varias señales

Los encabezados de un lab **no** se distinguen solo por tamaño. Distinguir por
tamaño obliga a comparar dos encabezados conscientemente; combinar señales
deja reconocer el nivel de un vistazo.

| Nivel | Tamaño | Peso | Color | Señal propia |
| --- | --- | --- | --- | --- |
| h2 | 28px | 650 | `--texto` | línea separadora arriba |
| h3 | 21px | 550 | `--texto-medio` | barra de acento a la izquierda |
| cuerpo | 16px | 400 | `--texto` | — |

El h2 **no** lleva marcador lateral: ya tiene su línea, y una segunda señal lo
acercaría al h3 en vez de distinguirlo.

El marcador del h3 es un `::before` absoluto colgando a `-12px`, **no** un
`border-left`. Con borde, el texto del h3 se correría a la derecha y perdería
la alineación con el cuerpo. El desplazamiento cae dentro del padding del
contenedor, así que no desborda ni a 360px de ancho.

Los cambios de peso y color del h3 están acotados a `.prosa` (contenido del
lab). El `h3` se usa también en las tarjetas del home y en las fichas de
`/sobre-mi`, donde es el elemento principal y atenuarlo le restaría presencia.

### Ritmo vertical

Deliberadamente **asimétrico**: mucho más aire arriba que abajo. Un
encabezado con el mismo margen de los dos lados flota entre dos bloques y no
se sabe a cuál pertenece.

Variables: `--h2-arriba`, `--h2-abajo`, `--h2-aire-linea`, `--h3-arriba`,
`--h3-abajo`, y dos casos especiales para encabezados consecutivos,
`--h3-tras-h2` y `--h3-tras-h3`.

Resultado: h2 con 72px arriba contra 16px abajo (4.5:1); h3 con 48px contra
8px (6:1). Un h2 después de cualquier cosa conserva siempre su tratamiento
completo, porque siempre es un corte mayor.

Espaciado general: escala `--e-1` … `--e-24`. Usar siempre esas variables en
vez de píxeles sueltos.

### Color

Paleta gris pizarra con **un** color de acento (teal), usado con moderación:
enlaces, la píldora de categoría y el marcador del h3. Nada más.

Modo oscuro **solo** por `prefers-color-scheme`, sin botón de cambio manual.
Es deliberado: menos piezas que mantener, y ningún JavaScript ni estado que
persistir. No agregues un selector de tema sin que te lo pidan.

Tokens de chips: `--chip-fondo`, `--chip-borde`, `--chip-texto`. Son más
oscuros que `--superficie` a propósito: como son cajas chicas rodeadas de
texto, con poco contraste dejan de leerse como elementos definidos y parecen
manchas.

### Grupos de etiquetas en un lab

Herramientas, MITRE ATT&CK y Función se distinguen por **color y por trazo**:
acento sólido / neutro sólido / neutro **punteado**.

El punteado no es capricho. En modo oscuro `--acento` (#5eead4) y `--texto`
(#e2e8f0) quedan a **1.20:1** de contraste entre sí — medido, no supuesto —
así que dos barras de 2px con esos colores se verían prácticamente iguales.
Además, confiar solo en el color deja fuera a quien no distingue tonos.

## Bloques de código

Resaltado con Shiki en tiempo de build: no se envía JavaScript al navegador,
el HTML ya sale coloreado. Dos temas a la vez (`github-light` / `github-dark`);
los colores del claro van escritos en el HTML y los del oscuro llegan en
variables `--shiki-dark` que `global.css` activa por media query.

- **Teclado**: Astro marca los `<pre>` con `tabindex="0"` por su cuenta. Se
  puede entrar al bloque y desplazarlo con las flechas. No hace falta agregar
  nada.
- **Táctil**: nativo del `overflow-x`.
- Ver "NO TOCAR" puntos 2, 3 y 4 antes de modificar cualquier cosa acá.

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
  del Markdown con `:global()` acotado a `.prosa`.
- `src/pages/404.astro` compila a `dist/404.html`, que GitHub Pages sirve
  solo ante cualquier URL equivocada. En dev se ve entrando a `/404`.
- `src/pages/sobre-mi.astro` tiene **dos banderas que se evalúan en el build**:
  - `hayCV`: comprueba con `existsSync` si existe `public/cv.pdf`. Si no
    está, la sección entera del currículum no se genera, en vez de publicar
    un botón que lleva a un 404. Para activarla basta con dejar el PDF ahí.
  - `hayCertificaciones`: booleano manual, hoy en `false` porque todavía no
    hay ninguna. El markup ya está escrito esperando; el comentario del
    archivo tiene los pasos para reactivarla.

  Los comentarios `REEMPLAZAR` de esa página son `{/* ... */}` de Astro:
  quedan en el código fuente y **no** se publican.

## Arquitectura

- Astro 7, sin integraciones de framework instaladas. Prácticamente cero
  JavaScript en el cliente: la única excepción es un `<script is:inline>` de
  siete líneas en `sobre-mi.astro`, que arma el enlace `mailto:` del correo
  en el navegador para no publicarlo en el HTML estático.
- `src/pages/` usa routing basado en archivos: cada archivo es una ruta.
  `labs/[...id].astro` es la ruta dinámica que genera una página por lab.
- `src/lib/labs.ts` es el **único** punto de lectura de la colección. Ahí vive el
  filtrado de borradores y el orden por fecha; no duplicar esa lógica en las páginas.
- `src/content.config.ts` define la colección `labs` con la Content Layer API de
  Astro 5+ (`loader: glob(...)`), no la carpeta mágica de versiones viejas.
- `src/styles/global.css` concentra los tokens de diseño arriba del archivo.
- `public/` contiene assets estáticos servidos tal cual, **sin pasar por
  el filtro de borradores ni por la optimización de imágenes**. Hoy tiene
  un solo archivo: `favicon.svg` (monograma BA). El `.ico` se borró a
  propósito para no mantener dos archivos sincronizados, y todos los
  navegadores en uso soportan favicons en SVG.
  Las capturas de los labs **no** van acá: ver "Capturas e imágenes".
- `src/assets/labs/<slug>/` guarda las capturas de cada lab, para que
  Astro las procese en el build.
- `astro.config.mjs` define `site: 'https://achibury.github.io'`, necesario para que las URLs absolutas salgan bien en GitHub Pages. Al ser sitio de usuario (no de proyecto), no lleva `base`.
- `tsconfig.json` extiende el preset `strict` de Astro.
- Despliegue automático: `.github/workflows/deploy.yml` compila con `withastro/action@v3` (Node 22) y publica con `actions/deploy-pages` en cada push a `main`.
- `AGENTS.md` es un hardlink a este archivo: editarlo en su sitio (no reemplazarlo) para que ambos sigan sincronizados. `Write` y `Edit` rompen el enlace; hay que truncar el archivo existente y escribir encima.

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

### La imagen de vista previa

`public/og.png` (1200×630) se genera con:

```
node scripts/generar-og.mjs
```

El script usa `sharp`, que ya viene con Astro para optimizar imágenes, o
sea que no agrega dependencias. Los colores salen de la paleta del modo
oscuro de `global.css`. Hay que volver a correrlo si cambia el nombre o la
línea de posicionamiento; el archivo generado se commitea.

## Documentación

Documentación completa: https://docs.astro.build

Consultar estas guías antes de trabajar en tareas relacionadas:

- [Agregar páginas, rutas dinámicas o middleware](https://docs.astro.build/en/guides/routing/)
- [Trabajar con componentes Astro](https://docs.astro.build/en/basics/astro-components/)
- [Usar componentes React, Vue, Svelte u otros frameworks](https://docs.astro.build/en/guides/framework-components/)
- [Agregar o gestionar contenido](https://docs.astro.build/en/guides/content-collections/)
- [Agregar estilos o usar Tailwind](https://docs.astro.build/en/guides/styling/)
- [Soportar múltiples idiomas](https://docs.astro.build/en/guides/internationalization/)

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
hardening de un router Cisco, `categoria: infraestructura`.

El header lleva el **monograma BA** en vez del nombre en texto. Todo lo
de la marca está en la sección "La marca"; la fuente única es
`src/lib/logo.ts`.

`npm run build` genera **6 páginas** (home, `/labs`, el detalle del lab,
`/herramientas`, `/sobre-mi` y `404`) más `sitemap-index.xml`.

Los otros dos `.md` de `src/content/labs/` — el de PowerShell/Sigma y el
de Volatility — son **contenido de ejemplo ficticio** con `borrador: true`.
Se conservan como referencia de formato y no generan página. Si el conteo
de páginas no te cuadra, esa es la razón; no está roto.

Los labs largos llevan **tabla de contenidos**: barra a la derecha en
escritorio, desplegable en móvil. Se enciende sola según el largo del
lab, así que hoy la tiene el de hardening y ninguno de los dos
borradores. Ver "Tabla de contenidos de un lab".

## Pendientes

Cosas abiertas a hoy, verificadas contra el código:

- **`/herramientas` es un placeholder.** Dice "Sección en construcción".
- **No existe `public/cv.pdf`**, así que la sección del currículum de
  `/sobre-mi` no se genera. Es a propósito: mejor sin sección que con un
  botón roto. Se activa sola al dejar el PDF ahí.
- **`hayCertificaciones` está en `false`** en `sobre-mi.astro`, porque
  todavía no hay ninguna. El markup ya está escrito esperando.
- **V2 — el header envuelve en dos filas a 360px.** Medido con las
  métricas reales de Segoe UI a 14px: el menú completo mide 212px y el
  ancho disponible a 360px es 312px (360 menos 24 de padding por lado).
  Con el nombre en texto (117px) daba 361 y no cabía. Con el logo a 26px
  (40px de ancho) da 284 y **entra en una fila**, así que el logo lo
  mejoró — pero el margen es de 28px y cualquier enlace nuevo en el menú
  lo vuelve a romper. Queda anotado, **no arreglado**: la salida
  probablemente sea un menú colapsable, y eso es una decisión de diseño
  aparte.

- **El filtro de `/labs` está decidido pero NO construido.** El análisis
  completo (qué lógica, qué controles, cómo degrada sin JavaScript) está
  en "Filtros de /labs". Se construye cuando haya labs que filtrar, no
  antes. Y hay **dos cosas que resolver primero**, las dos anotadas ahí:
  que `funcion` sea opcional en el schema, y que `categoria` y `funcion`
  se solapen.

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
dibujan; ver "La marca".

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

Doce cosas que **parecen** redundantes o simplificables y no lo son. Cada
una se ve como código que sobra, y en **los doce casos** quitarla rompe
algo sin que el build se queje: el daño solo se ve mirando la página.

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

**El correo en los metadatos de git es deliberado.** La autoría de los
commits usa `benjamin.achibury@protonmail.com` en texto plano y el
repositorio es público. Eso **no** es una fuga ni una contradicción con lo
de arriba: es la misma dirección que el portafolio publica a propósito
para que lo contacten. Lo que el `<span>` partido evita es el barrido
automático del HTML, que es de donde sale el grueso del spam; que la
dirección esté también en el historial de git es un costo aceptado.

Decisión zanjada: **no lo reportes como hallazgo ni propongas reescribir
el historial.**

### 6. Las seis propiedades del código en línea

```css
:not(pre) > code {
  white-space: nowrap;
  display: inline-block;
  max-width: 100%;
  overflow-x: auto;
  vertical-align: bottom;
  line-height: 1.4;
}
```

**Parece** demasiada declaración para un `<code>` de una línea.

**No.** Cada grupo sostiene algo distinto:

- `white-space: nowrap` es el arreglo de fondo. Un fragmento como
  `telnet 10.0.10.1` lleva un espacio, y el navegador corta ahí: "telnet"
  quedaba al final de un renglón y la IP saltaba al siguiente, y se leían
  como dos cosas distintas en vez de un comando.
- Las tres del medio son la **guarda**. Con `nowrap` a secas, un fragmento
  que no entra en la medida de lectura se sale del contenedor y le mete
  scroll horizontal a la página entera. Convertirlo en caja propia con
  tope de ancho lo obliga a quedarse adentro.
- `line-height: 1.4` **no es estético**. Una caja `inline-block` más alta
  que el renglón que la contiene estira esa línea, y un párrafo con
  código queda con el interlineado desparejo. Con 1.4 la caja mide 25px
  contra los 27.2px del renglón: no lo empuja.

CSS no permite decir "no partas salvo que no quepa". Hay que elegir una de
las dos, y para fragmentos de una línea esta es la correcta.

### 7. `margin-inline: 0` en el blockquote de un lab

**Parece** que declarar un margen en cero es escribir de más.

**No.** El navegador le aplica al `blockquote` un `margin-inline: 40px`
por su cuenta, desde su hoja de estilos por defecto. Fijar solo
`margin-block` deja ese valor vivo. Ya pasó: el bloque de hallazgo
arrancaba 40px a la derecha del párrafo y del bloque de código de al lado,
y la causa no era ninguna regla nuestra sino una que no habíamos anulado.

### 8. `--toc-ancho: 288px` (y no 240, y tampoco 256)

**Parece** que 240px alcanzan de sobra: el h2 más largo del lab de
hardening, "Revisión de la configuración final", mide **210,4px** a 14px
y una barra de 240 deja 216px útiles.

**No.** El ítem **cambia de ancho al activarse**, porque el activo va en
peso 700. Medido con las métricas reales de Segoe UI a 14px:

| Estado | Peso | Ancho de tinta |
| --- | --- | --- |
| Reposo | 600 | 210,4px |
| **Activo** | **700** | **219,0px** |

Con 216px útiles el ítem entraba en reposo y **se partía en dos al
activarse**: la barra se reacomodaba sola justo al entrar a esa sección,
que es exactamente cuando el ojo la está mirando.

256px lo arreglaban **mientras la barra no tuvo caja**. Al agregarla, el
relleno y el borde se comen 34px más y vuelve a partirse. El reparto de
los 288px actuales:

```
 288  ancho de la barra
  -2  borde de la caja
 -32  relleno de la caja  (--e-4 por lado)
 -24  relleno del ítem    (--e-3 por lado)
 ---
 230  para el texto  ->  sobran 11px sobre los 219 del peor caso
```

El punto de corte de la rejilla (`69rem` en `Lab.astro`) sale de la misma
cuenta: si cambias uno hay que recalcular el otro. Los dos están
comentados con la aritmética completa.

### 9. `minmax(0, 1fr)` y `align-items: start` en la rejilla del lab

Las dos están en el `@media` de `Lab.astro` y las dos parecen ruido.

**`minmax(0, 1fr)`** parece que se puede escribir `1fr` a secas. **No.**
Un `1fr` pelado tiene como mínimo automático el `min-content` de lo que
contenga, y adentro hay tablas y bloques de código con líneas larguísimas
que no envuelven (ver punto 2). La columna se estiraría hasta el ancho de
la línea más larga y le metería scroll horizontal a **la página entera**.
El `minmax(0, …)` le permite achicarse.

**`align-items: start`** parece cosmético. **No: sin eso la barra no se
queda fija.** El valor de fábrica es `stretch`, que estira el ítem a toda
la altura de su fila; un elemento que ya ocupa toda su área no tiene por
dónde desplazarse, así que `position: sticky` deja de hacer efecto. No da
error ni se ve mal — la barra simplemente se va con el scroll.

### 10. El `rootMargin` gigante del scroll-spy

```js
rootMargin: '9999px 0px -80% 0px'
```

**Parece** un número puesto a lo bruto, que se arregla con una franja
prolija como `-15% 0px -75% 0px`.

**No.** Esa franja mide ~90px y un fotograma de scroll rápido avanza más
que eso: el encabezado la atraviesa sin quedar dentro, el estado no
cambia y el observador **no dispara**. Medido con la franja puesta: 7.000
píxeles de scroll sin que el ítem activo se moviera. La versión "prolija"
es exactamente la que está rota.

Explicado entero en "Tabla de contenidos de un lab".

### 11. La cabecera del lab NO cruza las dos columnas

```css
.lab--con-toc .cabecera { grid-area: 1 / 2; }   /* columna 2, con la prosa */
```

**Parece** que la cabecera debería ocupar el ancho completo, como
cualquier encabezado de página. Es lo primero que uno escribe:
`grid-column: 1 / -1`. Y de hecho **estuvo así**.

**No.** Con la barra a la izquierda, cruzar las dos columnas ancla la
cabecera al borde del contenedor mientras el contenido que le sigue se
queda en la columna del artículo. Medido:

| | Cruzando las dos columnas | En la columna 2 |
| --- | --- | --- |
| `h1` del lab | 184px | **520px** |
| Su primer párrafo | 520px | **520px** |
| Desalineación | **336px** | **0** |

O sea que el título del lab queda separado de su propio cuerpo por
336px. **El corte no aparece contra el header: aparece DENTRO del
artículo**, entre un título y el párrafo que le sigue, y eso se ve
bastante peor que el desplazamiento contra el marco del sitio.

La página está pensada con **dos** bordes verticales, no tres:

```
184px   marca del header · índice · footer      (el marco del sitio)
520px   chips · h1 · resumen · cuerpo · volver  (el artículo entero)
```

Cualquier cosa que saque un elemento del artículo de la columna 2 agrega
un tercer borde y rompe eso. El build no dice nada.

### 12. La línea del h2 usa `--chip-borde`, no `--borde`

```css
.prosa h2 { border-top: 1px solid var(--chip-borde); }
```

**Parece** una inconsistencia. Todas las demás líneas de 1px del sitio
—la de la cabecera del lab, la de las tarjetas, el `hr`, el borde de las
celdas de una tabla— usan `--borde`. Esta no, y lo primero que uno hace
al "ordenar" es unificarla.

**No.** Esa línea es la única señal propia que tiene un corte de sección,
porque el hueco vacío encima de un h2 (64px) no se distingue de un
vistazo del que tiene un h3 (48px). Con `--borde` la línea da **1,23:1 en
claro y 1,72:1 en oscuro**: no se ve, y el corte se queda sin nada. Con
`--chip-borde` son **2,02:1 y 3,09:1**.

Es el mismo criterio que ya está escrito para los chips y para la pista
del índice: un elemento que tiene que *leerse como elemento* necesita más
contraste que uno que solo separa. Las demás líneas del sitio separan; esta
anuncia.

Y va en **1px, no 2**. En este diseño el 2px ya significa otra cosa: es el
borde de los grupos de chips de la cabecera del lab. Engrosarla la
convertiría en decoración en vez de estructura; si hace falta más
presencia, la respuesta es el número de sección, no una línea más gorda.

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
| `actualizado` | date | **opcional**, se emite como `dateModified` |
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

**`actualizado` es para ediciones de fondo, no para tipeos.** Se pone
cuando el contenido cambia de verdad: se agrega un hallazgo, se corrige
una conclusión, se rehace una prueba. Si está, sale como `dateModified`
en los datos estructurados; si no está, esa propiedad **no aparece** —
no se rellena con la fecha del build, porque eso afirmaría que el lab se
modificó en cada compilación.

El schema tiene una guarda: **si `actualizado` es anterior a `fecha`, el
build falla** nombrando el campo. Un `dateModified` previo al
`datePublished` no tiene sentido y los buscadores lo tratan como dato
sucio. Es la única regla del schema que compara dos campos entre sí, y
por eso es la única que usa `.refine()` sobre el objeto en vez de validar
un campo suelto.

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

## Convenciones de contenido de un lab

### El blockquote es un hallazgo, no una cita

En un lab, `>` marca **el hallazgo clave** de una sección: qué arrojó un
escaneo, la evidencia de que un control quedó funcionando. No se usa para
citar a nadie.

Van **2 o 3 por lab**. Funciona porque es escaso: uno cada dos párrafos
deja de señalar nada. Conviene abrirlos con una frase corta en negrita,
que es lo que se lee al escanear la página sin leer:

```markdown
> **Dos puertos abiertos.** Telnet en el 23 y el servidor web de IOS en
> el 80. Ninguno de los dos cifra nada.
```

El tratamiento visual (fondo propio, barra de acento, mismo tamaño que el
cuerpo) está en `Lab.astro`. Va al mismo tamaño que el cuerpo a propósito:
a 18px competía con el h3 y el ojo lo leía como otro nivel de encabezado.
Ver "NO TOCAR" punto 7 antes de tocarlo.

### Una subsección se escribe con `###`, no con negrita

Este es el error más fácil de cometer escribiendo, porque en el editor
se ve bien: abrís un párrafo con una frase en negrita, seguís con la
explicación, y parece que quedó separado.

```markdown
**El switch no tenía cliente SSH.** Acá estuvo el problema real…
```

**En la página no queda separado nada.** Ese párrafo no hereda ninguna
de las señales del h3 —ni el peso, ni `--texto-medio`, ni la barra de
acento, ni los 48px de aire arriba contra 8 abajo— así que tres bloques
seguidos se leen como un solo muro. Y hay un segundo daño, menos
visible: no sale de `render()`, así que no existe para el esquema de
encabezados ni para quien navegue con lector de pantalla.

La regla es simple: **si abre un bloque y funciona como título, es un
`###`**; y un encabezado no lleva punto final.

Lo que **sí** son usos legítimos de la negrita en un lab, y no hay que
tocar:

| Uso | Ejemplo | Por qué se queda |
| --- | --- | --- |
| Apertura de un blockquote | `> **Dos puertos abiertos.** Telnet…` | Es lo que pide la guía del bloque de hallazgo |
| Entradilla de un ítem de lista | `- **Acceso físico.** Quien llegue…` | Convertirlo rompería la lista |
| Énfasis dentro de una frase | `…se rechaza **antes** de pedir credenciales` | No abre nada, es énfasis |

Para barrer un lab entero buscando el patrón, salteando los bloques de
código:

```
awk '/^```/{d=!d;next} d{next} /^\*\*/{print NR"\t"$0}' archivo.md
```

### Credenciales y hashes van como `<REDACTADO>`

Cualquier hash de contraseña o secreto que aparezca en la salida de un
comando se reemplaza en el texto:

```
enable secret 5 $1$<REDACTADO>
```

Se **conserva el prefijo del algoritmo** (`$1$`, `$9$`) cuando el punto
del lab es justamente ese: el prefijo es la información técnica, el resto
es el secreto.

Una contraseña de laboratorio deliberadamente mala — `cisco123` en el
estado "antes" de un hardening — sí se muestra: es el punto del ejercicio
y no protege nada real. Lo que no se muestra es un hash de verdad, que es
material para romper por fuerza bruta.

**Ojo con las capturas.** Estuvo a punto de pasar una vez: el texto tenía
los hashes redactados y la captura que ilustraba ese mismo comando los
mostraba enteros. Redactar el `.md` no redacta la imagen. Es una de las
razones de la regla "si es solo texto, va como bloque de código".

## Sistema de diseño

Todo vive en el `:root` de `src/styles/global.css`. Reestilizar debería ser
mayormente cambiar ese bloque.

### Anchos

Tres variables:

- `--ancho-prosa: 70ch` — texto corrido. La unidad `ch` es el ancho del
  carácter cero, así que dice literalmente "70 caracteres por línea".
  **Medido con Segoe UI a 16px son 603,8px**, bastante menos de lo que
  uno supone al ver "70ch".
- `--ancho-contenedor: 1120px` — header, footer, listados.
- `--toc-ancho: 288px` — la barra de la tabla de contenidos de un lab.
- Los bloques anchos (`pre`, `img`, `table`) **no** están en la regla de
  medida de lectura, así que quedan libres y llegan hasta el contenedor.

Vale la pena tener presente el reparto real dentro del contenedor
(1120 menos 24 de relleno por lado = **1072px útiles**), porque explica
por qué la barra de contenidos cabe sin apretar la lectura:

| | Ancho |
| --- | --- |
| Prosa (70ch) | 603,8px |
| Bloque de código más ancho del lab de hardening | 707px |
| Imagen ancha | hasta 1072px |

O sea que a la derecha de la prosa sobraban **468px**. La restricción
nunca fue el texto: son las imágenes.

La prosa va alineada a la izquierda, no centrada, para que su borde coincida
con el del header y el footer. Hay dos excepciones a propósito:
`/sobre-mi`, que usa `.contenedor--centrado` para angostar el bloque y
centrarlo, y la página de un lab **con** tabla de contenidos, donde el
artículo entero se corre a la derecha del índice. Ahí la alineación no se
pierde: se reemplaza por dos bordes limpios, el del marco del sitio y el
del artículo. Ver "Tabla de contenidos de un lab".

### Tipografía

Escala `--t-xs` … `--t-2xl` (12 / 14 / 16 / 18 / 21 / 28 / 36 px) más
`--t-mono: 0.9em` para código.

Los saltos son amplios a propósito: si h2, h3 y cuerpo se diferencian poco,
el ojo no los lee como tres niveles distintos sino como variaciones del mismo.

### Los pesos que la fuente tiene de verdad

`--fuente` resuelve a **Segoe UI** en Windows, y **Segoe UI no tiene peso
500**. Por las reglas de emparejamiento de CSS, un `font-weight: 500` cae
a Regular y no se ve ningún cambio. Medido con la fuente real,
"Herramientas" a 14px:

| Peso pedido | Ancho de tinta | Lo que se usa |
| --- | --- | --- |
| 300 | 77px | Light |
| 350 | 79px | Semilight |
| 400 | 81px | Regular |
| **500** | **81px** | **Regular — no hace nada** |
| 550 | 84px | Semibold |
| 600 | 84px | Semibold |
| 650 | 88px | Bold |
| 700 | 88px | Bold |

O sea que los escalones reales son **300 / 350 / 400 / 600 / 700**, y
entre Regular y Semibold no hay nada intermedio. Antes de poner un peso
que no esté en esa lista, comprobá que se vea: si pides 500 esperando
"un poco más que normal", no vas a obtener nada.

Por eso el menú del header usa 600 en reposo y 700 en el activo, no 500 y
600.

### Jerarquía por varias señales

Los encabezados de un lab **no** se distinguen solo por tamaño. Distinguir por
tamaño obliga a comparar dos encabezados conscientemente; combinar señales
deja reconocer el nivel de un vistazo.

| Nivel | Tamaño | Peso | Color | Señal propia |
| --- | --- | --- | --- | --- |
| h2 | 28px | 650 | `--texto` | número de sección + línea separadora arriba |
| h3 | 21px | 550 | `--texto-medio` | barra de acento a la izquierda |
| cuerpo | 16px | 400 | `--texto` | — |

El h2 **no** lleva marcador lateral: ya tiene su línea, y una segunda señal lo
acercaría al h3 en vez de distinguirlo.

Lo mismo aplica al **menú del header**, y ahí hay una restricción que es
fácil de romper sin darse cuenta:

| Estado | Peso | Color |
| --- | --- | --- |
| Reposo | 600 | `--texto-suave` |
| Hover | 600 | `--texto` |
| Activo (`aria-current`) | 700 | `--texto` |

El activo se distingue por **peso y color a la vez**, y las dos señales
tienen que sobrevivir a cualquier cambio del reposo. Concretamente: el
reposo se dejó en `--texto-suave` y **no** se subió a `--texto-medio`
aunque eso equilibraría un poco más el header, porque achicaba la
separación de color contra el activo de **2,36:1 a 1,72:1** en claro y de
**2,08:1 a 1,48:1** en oscuro. El activo dejaba de saltar a la vista. El
peso 600 ya resuelve el equilibrio óptico sin pagar eso.

Si algún día subís el color del reposo, hay que darle al activo una
tercera señal (un borde inferior, por ejemplo) o se pierde.

El **gap entre enlaces** es `calc(var(--e-4) + var(--e-1))`, o sea 20px,
porque la escala salta de 16 a 24 y los dos extremos fallan: 16 aprieta y
24 desarma el grupo. Y no lo bajes buscando espacio en móvil — a 360px
sobran **31px** con este gap, y 23px incluso con 24. El ancho nunca fue
la restricción.

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

Resultado: h2 con 96px arriba contra 16px abajo (6:1); h3 con 48px contra
8px (6:1). Un h2 después de cualquier cosa conserva siempre su tratamiento
completo, porque siempre es un corte mayor.

**Los 96px del h2 no son todos hueco vacío, y la diferencia importa.** Son
64 de margen más 32 de relleno, y el relleno cae *debajo* de la línea
separadora. O sea que lo que el ojo ve como vacío antes de encontrar
cualquier señal son 64px, no 96.

Eso es lo que estuvo roto durante un tiempo: el h2 y el h3 tenían los dos
`--e-12`, o sea **48px de vacío idénticos**, y lo único que distinguía un
corte de sección de uno de subsección era una línea a 1,23:1 que no se veía.
El lab se leía como un bloque continuo, y no era una impresión: estaba
medido. Ver "Separación de secciones en un lab".

### Separación de secciones en un lab

Tres señales trabajando juntas encima de cada `h2`, y las tres hacen falta:

| Señal | Qué aporta |
| --- | --- |
| 64px de vacío, luego la línea, luego 32px | El corte se anticipa antes de leer nada |
| Línea de 1px en `--chip-borde` | 2,02:1 en claro y 3,09:1 en oscuro |
| Número de sección `01`…`08` en acento | La marca que engancha el ojo al hacer scroll |

**El aire solo no alcanza, y esta es la razón para no seguir subiéndolo.** El
h3 ya se lleva 48px, así que agrandar el del h2 cambia una proporción pero
nunca crea una diferencia de categoría. Y a 96px la asimetría contra los
16px de abajo ya es 6:1; a 128 sería 8:1 y el encabezado empezaría a flotar
sin pertenecer a nada, que es justo lo que el ritmo asimétrico existe para
evitar.

**El número sale de un contador CSS**, así que el Markdown no lleva ningún
número escrito a mano y reordenar secciones renumera solo:

```css
.lab--con-toc .prosa { counter-reset: seccion; }
.lab--con-toc .prosa h2::before {
  counter-increment: seccion;
  content: counter(seccion, decimal-leading-zero);
}
```

Cuatro cosas que no son obvias:

- **Va encima del título, no colgando en el canalón** como el marcador del
  h3. No es estética: "01" mide 16px a 12px de cuerpo y colgarlo a la
  izquierda necesitaría 28px de canalón; en móvil el canalón es el relleno
  del contenedor, que son **24px**. No cabe.
- **Solo en labs largos**, por eso cuelga de `.lab--con-toc`. Es el mismo
  umbral que decide la tabla de contenidos y por el mismo motivo: numerar
  seis secciones que entran en tres pantallas es decoración, no
  orientación. Los dos auxiliares de navegación aparecen y desaparecen
  juntos.
- **El número NO entra en el nombre accesible del encabezado.** Comprobado
  leyendo el árbol de accesibilidad de Chrome: el `h2` se sigue llamando
  `"Contexto"` y no `"01 Contexto"`, así que el texto del encabezado y el
  del ítem del índice siguen siendo el mismo. Si algún navegador lo
  incluyera, la salida es `content: counter(…) / ""`.
- **`decimal-leading-zero` y no `decimal`**: dos dígitos siempre, así la
  columna de números no se corre entre la sección 9 y la 10.

**Se descartó una banda de fondo detrás del h2**, que era la opción más
contundente de las tres que se probaron. Motivo medido: con `--superficie`
la banda queda a **1,00:1 del fondo de un bloque de código** en modo oscuro
y 1,05:1 en claro, o sea indistinguible. En un lab con 18 bloques de
código, el lector aprende que "rectángulo con fondo" significa código y
después se encuentra con que a veces es un título. Es peor que no tener
señal: es una señal que miente. Arreglarlo pediría un cuarto tono de
superficie, y el diseño tiene tres.

Espaciado general: escala `--e-1` … `--e-24`. Usar siempre esas variables en
vez de píxeles sueltos.

### Color

Paleta gris pizarra con **un** color de acento (teal), usado con moderación.
Son cinco usos y ninguno es decorativo:

| Uso | Qué marca |
| --- | --- |
| Enlaces | Acción |
| Píldora de categoría | Clasificación |
| Marcador del h3 | Posición estructural |
| Barra del ítem activo del índice | Posición estructural |
| Número de sección del h2 | Posición estructural |

Los tres últimos son el mismo signo para lo mismo — "estás acá" o "acá
empieza algo" — y por eso los dos primeros se dibujan igual, una barra
angosta al costado izquierdo. Si agregas un sexto uso, que sea por la
misma razón: acento chico que marca estructura, nunca adorno.

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

## Tabla de contenidos de un lab

Barra con las secciones del lab: fija a la derecha en escritorio,
desplegable arriba del artículo en móvil.

### Las tres piezas

| Archivo | Qué hace |
| --- | --- |
| `src/lib/toc.ts` | Decide **si** va y **qué** entra. Aritmética pura, sin `astro:content` |
| `src/components/TablaContenidos.astro` | La dibuja y estila |
| `src/layouts/Lab.astro` | La rejilla de dos columnas y el script de sección actual |

`toc.ts` está aparte de `labs.ts` a propósito: `labs.ts` importa
`astro:content`, que solo existe dentro de Astro, y esto conviene poder
verificarlo con `node` sin levantar el sitio.

Los `slug` salen de `render()`, que es la misma fuente de la que salen
los `id` del HTML. Por eso los enlaces apuntan siempre a un ancla que
existe: **no hay anclas que mantener a mano** y la barra se adapta sola a
cada lab.

### Solo h2, nunca h3

El lab de hardening tiene **8 h2 y 20 h3**. Los números de por qué no
entran los dos:

| | Ítems | Alto |
| --- | --- | --- |
| h2 + h3 | 28 | **773px** |
| solo h2 | 8 | **221px** |

773px no entran en un viewport de ~900px: la barra necesitaría su propio
scroll, y una tabla de contenidos que hay que desplazar para leerla deja
de ser un mapa.

Tampoco entran a lo ancho: el h3 más largo mide 263px a 13px contra los
232px útiles de la barra, así que se partiría en dos.

Y **anidarlos colapsados es peor**, no mejor: son 8 desplegables que el
lector tiene que abrir uno por uno para saber qué hay adentro. El valor
de un índice es leerlo de un vistazo.

### El umbral mide PALABRAS, no encabezados

```
>= 4 h2  Y  >= 1200 palabras (sin contar bloques de código)
```

Contar secciones **no alcanza**, y este es el dato que lo demuestra:

| Lab | h2 | Palabras | Barra |
| --- | --- | --- | --- |
| hardening-router-cisco | 8 | 2125 | **sí** |
| deteccion-powershell (borrador) | 8 | 516 | no |
| triaje-memoria (borrador) | 6 | 516 | no |

Fíjate en los dos primeros: **la misma cantidad de h2 y 4 veces menos
texto**. Contar encabezados mide cómo escribes, no cuánto hay que
recorrer. El de PowerShell son ~3 pantallas y la barra le sobra; el de
hardening son ~11.700px, unas 13 pantallas.

Los bloques de código se descuentan del conteo porque 100 líneas de
`show running-config` no son carga de lectura: se escanean o se saltan.

`encabezadosParaTOC()` devuelve una **lista vacía** en vez de un booleano.
Así arriba hay una sola cosa que mirar: si viene vacía no se dibuja nada
y la página se arma a una sola columna, sin reservar 288px al costado.

### Dónde va, y por qué a la izquierda

A la izquierda, con `grid-template-columns: var(--toc-ancho) minmax(0, 1fr)`
desde `69rem`. Se lee de izquierda a derecha, así que el ojo encuentra el
índice antes de entrar al texto, y el final de cada línea queda libre en
vez de competir con la barra.

El reparto de anchos queda así:

| | Antes | Con barra |
| --- | --- | --- |
| Prosa | 603,8px | **603,8px** (intacta) |
| Bloque de código más ancho | 707px | **707px** (entra, 29px de sobra) |
| Imagen ancha | 1072px | **736px** (−31%) |

Los 707px están **medidos en el navegador**, no calculados: se clonó cada
`<pre>` con `width: max-content` y se leyó el ancho. Verificado además
que **ninguno de los 18 bloques de código desborda** con la columna en
736px.

**La imagen es el único que paga**, y es el costo aceptado. Se verificó
que las capturas de terminal siguen legibles a 736px: la letra baja de
~14px efectivos a ~10,6px, apretada pero leíble. Si alguna se vuelve
ilegible, la salida correcta no es angostar la barra sino convertirla en
bloque de código, que es lo que la regla de "Capturas e imágenes" ya pide
para texto de terminal.

### Dos bordes verticales, y hay que defenderlos

El costo de la izquierda es que el artículo se corre 336px respecto del
header y del footer. La página queda con **dos** bordes en vez de uno:

```
184px   marca del header · índice · footer      (el marco del sitio)
520px   chips · h1 · resumen · cuerpo · volver  (el artículo entero)
```

Los dos son limpios y cada uno es consistente consigo mismo. Un tercer
borde sí rompe el diseño, y hay una forma muy fácil de agregarlo sin
darse cuenta: **que la cabecera del lab vuelva a cruzar las dos
columnas**. Está explicado en "NO TOCAR" punto 11, con los números.

Se probó primero esa versión y el escalón entre el `h1` y su primer
párrafo era claramente lo peor de las dos opciones, peor incluso que la
desalineación contra el header.

**La barra arranca arriba, al costado de la cabecera**, y abarca las dos
filas de la rejilla (`grid-area: 1 / 1 / 3 / 2`). Las dos cosas tienen
motivo:

- **Abarcar las dos filas no es para estirarla**, es porque
  `position: sticky` solo se desplaza dentro de su área de rejilla. En la
  fila 1 sola, su área sería el alto de la cabecera y la barra se
  despegaría tras ~400px de scroll. Verificado: con el área de dos filas,
  tras 5.000px la barra sigue fija a 32px del borde.
- **Arriba y no debajo de la cabecera.** Debajo funciona igual, pero deja
  ~400px vacíos en la esquina superior izquierda —la parte más valiosa de
  la primera pantalla— y empuja el índice por debajo del pliegue.

Ver "NO TOCAR" puntos 8, 9 y 11 antes de tocar el ancho o la rejilla.

### La caja, y por qué NO se subió el color del reposo

La barra va en una caja propia: fondo `--superficie`, borde de 1px,
radio y relleno. El rótulo "EN ESTA PÁGINA" va a `--texto` y peso 700.

Sin eso se leía como nota al margen — texto atenuado a 14px al costado
del artículo, sin nada que dijera dónde empieza y dónde termina. Se
evaluaron las dos salidas y **la causa no era el color del texto**:

| | Subir el reposo a `--texto-medio` | La caja |
| --- | --- | --- |
| Contraste del reposo | 10,35:1 / 9,77:1 | 7,24:1 / 5,71:1 |
| **Separación reposo↔activo** | **1,72:1 / 1,48:1** | **2,36:1 / 2,08:1** |
| Ancho que cuesta | 0 | 32px |

Subir el reposo cuesta justo la señal que distingue al activo, y deja
esos números en los mismos valores por los que el cambio ya se había
descartado en el menú del header. La caja ataca lo que realmente
fallaba —que nada separaba la barra del cuerpo— y no gasta contraste.

**La pista cambió de `--borde` a `--chip-borde` por culpa de la caja.**
La línea vertical que recorre los ítems vivía sobre `--fondo`, donde
`--borde` daba 1,23:1. Sobre `--superficie` cae a **1,18:1** en claro: se
vuelve invisible, y la barra de acento del activo queda flotando sin
riel. Con `--chip-borde` son **1,93:1 y 2,53:1**, mejor incluso que antes
de la caja. Es el mismo motivo que ya está escrito para los chips: algo
apoyado sobre una superficie necesita más contraste que algo sobre el
fondo de la página.

El rótulo comparte color y peso con el ítem activo y aun así no se
confunden: 12px contra 14px, versalitas y separación entre letras, y el
activo lleva además su barra de acento.

### Móvil: es un `<details>`, y es el MISMO marcado

No hay dos versiones. Un solo `<details open>` que en escritorio cae en la
columna de la derecha y en móvil queda como bloque desplegable arriba del
artículo.

`<details>` nativo y no un desplegable escrito a mano porque trae gratis
lo que si no habría que programar: el `<summary>` ya es un botón, responde
a Enter y Espacio, y el lector de pantalla anuncia si está expandido o
contraído. **Cero JavaScript.**

Va `open` de entrada. En móvil eso son ~303px arriba del artículo (~47%
de una pantalla de 640px de alto), la caja incluida. Se aceptó a cambio de no tener dos
marcados: son 8 líneas y el lector pasa por ellas una vez. Si algún día
molesta, se cierra en móvil y se fuerza abierta en escritorio con
`details::details-content { content-visibility: visible }` — una regla.

El `<summary>` **se ve en las dos pantallas**. Escondiéndolo en escritorio
la barra queda sin rótulo visible y hay que deducir que es un índice.

### La sección actual es la única parte con JavaScript

Sin el script, `scroll-margin-top` sigue haciendo que el encabezado no
aterrice pegado al borde de la ventana: los enlaces del índice navegan
bien igual. Lo único que se pierde es el seguimiento.

**No agregues un resaltado `:target` en el encabezado.** Estuvo, como
respaldo sin JavaScript, y se quitó: `:target` no se limpia solo, así que
el encabezado quedaba pintado hasta navegar a otra ancla.

#### Una sola fuente de verdad y tres disparadores

`recalcular()` es la **única** función que decide cuál sección está
activa; los tres disparadores solo la llaman. Esa separación es lo que
evita que se contradigan entre sí.

| Disparador | Para qué |
| --- | --- |
| `IntersectionObserver` sobre los h2 | El caso normal: seguir el scroll |
| Centinela de 1px al final del `<body>` | Tocar fondo |
| `click` en la lista | Saltar a una sección |

Los dos últimos **no son adornos**: sin ellos hay dos casos en los que el
índice se queda clavado, y los dos se vieron en uso.

- **Al hacer clic, el destino aterriza POR ENCIMA de la línea y nunca la
  cruza**, así que el observador no se entera y el índice sigue marcando
  la sección de donde veníamos. El escucha de `click` lo marca al
  instante. No pelea con el observador: es la misma respuesta que daría
  `recalcular()` en esa posición, solo que llega sin esperar un cruce que
  no va a ocurrir.
- **La última sección no se marca nunca** si lo que cuelga de ella mide
  menos del 80% de la ventana: su encabezado no alcanza a subir hasta la
  línea porque no hay contenido abajo que lo empuje. El centinela dispara
  el recálculo al llegar al fondo. Va al final del `<body>` y no del
  artículo a propósito: debajo del artículo todavía está el footer.

#### El `rootMargin` es un semiplano, NO una franja

`9999px 0px -80% 0px`. La región va desde muy arriba de la ventana hasta
el 20% de su alto, o sea que un encabezado intersecta exactamente
mientras está por encima de esa línea — la misma condición que usa
`recalcular()`. **Los dos números son el mismo umbral visto de dos
maneras: si cambias uno, cambia el otro.**

**No lo "ordenes" convirtiéndolo en una franja fina** tipo
`-15% 0px -75% 0px`. Parece más prolijo y da histéresis, pero esa franja
mide ~90px y un fotograma de scroll rápido —trackpad, Av Pág, arrastrar
la barra— avanza mucho más: el encabezado **atraviesa la franja sin
quedar nunca dentro**, el estado va de "fuera" a "fuera" y el observador
no dispara. Medido con la franja puesta: **7.000px de scroll sin que el
ítem activo se moviera**. Con el semiplano el cambio de estado no depende
de caer dentro de nada, solo de cruzar la línea, así que funciona a
cualquier velocidad.

Se pierde la histéresis y está bien: solo importaría con un encabezado
detenido justo sobre la línea, y el scroll quieto no tiembla.

El `aria-current` va en `"location"` y no `"page"`: el enlace del header
ya usa `"page"` para decir en qué página estás, y esto marca una posición
**dentro** de la página. Se estila el atributo directamente y no una
clase, para que lo visual y lo anunciado no puedan desincronizarse.

El ítem activo se distingue por **tres** señales: color (`--texto-suave` →
`--texto`), peso (600 → 700) y la barra de acento. Los contrastes van
medidos contra `--superficie`, que es el fondo de la caja donde vive el
texto, no contra `--fondo`: reposo 7,24:1 claro / 5,71:1 oscuro; activo
17,06:1 y 11,87:1. La barra de acento da 5,23:1 y 9,89:1, por encima del
3:1 que pide una señal no textual.

La **separación de color entre reposo y activo** es 2,36:1 en claro y
2,08:1 en oscuro, los mismos números del menú del header. Ese es el valor
que hay que defender si algún día se toca el color del reposo: se evaluó
subirlo a `--texto-medio` para dar presencia y caía a 1,72:1 y 1,48:1,
justo los valores por los que ese cambio ya se había descartado en el
header. La presencia se resolvió con la caja, que no cuesta contraste.

**El header de este sitio NO es fijo** (no hay un solo `position` en
`Header.astro`), así que el `scroll-margin-top` no tiene que compensar su
alto: alcanza con un respiro. Casi todas las guías de TOC asumen lo
contrario.

### Lo que cuesta

Página del lab, medido:

| | Bruto | Gzip | Peticiones CSS |
| --- | --- | --- | --- |
| Antes | 42.120 | 11.852 | 1 |
| Después | 47.928 | 13.714 | **2** |

La petición de más no es un descuido: los estilos de `Lab.astro` pasaron
de 3.788 a 5.241 bytes y cruzaron el umbral de 4kB con el que Astro
decide si mete el CSS en línea o lo saca a un archivo. Con un solo lab no
se gana nada; con veinte, ese archivo se cachea entre todos.

**Sigue habiendo cero archivos `.js`**: el script va en línea.

## Filtros de /labs

**Decidido, NO construido.** Está acá para retomarlo con el contexto
puesto, no para que exista a medias en el código. Se construye cuando
haya labs que filtrar — ver el umbral más abajo.

### Dos cosas que hay que resolver ANTES

**1. `funcion` es opcional en el schema.** Un lab que no la declare **no
aparecería bajo ninguna selección de función**: solo se lo encontraría con
el filtro limpio. Hoy los tres labs la declaran, así que no muerde, pero
el día que escribas uno de `notas` o `herramienta` sin función, desaparece
del filtro sin aviso. Dos salidas, hay que elegir una:

- Hacerla **obligatoria** en el schema, con la misma red de seguridad que
  ya tiene `herramientas`. Es lo recomendado: si la función va a ser un
  eje de navegación, no puede ser opcional.
- Que el filtro trate el caso, con una casilla "Sin función declarada".
  Honesto, pero le agrega ruido al control.

**2. `categoria` y `funcion` se solapan.** Mira lo que declaran los tres
labs de hoy:

| Lab | categoría | función |
| --- | --- | --- |
| hardening | infraestructura | proteger, identificar |
| powershell | **detección** | **detectar** |
| volatility | análisis | responder |

`deteccion` y `detectar` son el mismo concepto escrito dos veces;
`analisis`↔`responder` e `infraestructura`↔`proteger` van casi siempre
juntos. Dos facetas correlacionadas le dan al lector la ilusión de dos
controles independientes cuando la mayoría de las combinaciones está
vacía: "categoría=detección Y función=proteger" da cero casi siempre, y
no porque falten labs.

**Por eso el filtro arranca solo con FUNCIÓN.** `categoria` se evalúa
recién cuando haya labs suficientes para ver si aporta o duplica. Si al
cruzarlas casi todas las celdas quedan vacías, la respuesta correcta no
es tocar la interfaz: es que sobra un eje.

### La lógica es CUALQUIERA (unión), no TODAS (intersección)

Marcar `proteger` + `identificar` devuelve los labs que tengan **al menos
una** de las dos.

Modelado con 20 labs y 20.000 catálogos, extrapolando la distribución de
los tres `.md` de hoy (**promedio real: 1,33 funciones por lab**):

| Selección | CUALQUIERA | TODAS | TODAS da cero |
| --- | --- | --- | --- |
| 1 función | idénticas | idénticas | — |
| 2 funciones | 10,6 labs | **1,0 labs** | **42%** de los pares |
| 3 funciones | 14,5 labs | **0,10 labs** | **90%** |

Las dos fallan, pero fallan distinto. CUALQUIERA falla por **poco
selectiva** (dos casillas devuelven media biblioteca) y el lector desmarca
una. TODAS falla por **callejón sin salida**: la lista se vacía y no hay
forma de saber si es que no tienes labs de eso o si entendiste mal el
control.

La causa de fondo no es la interfaz, es el campo. `funcion` es
multivaluado en el schema pero **casi monovaluado en la práctica**: 1,33
de 5 posibles. La intersección tiene sentido cuando cada elemento carga
muchos valores; sobre un campo que casi siempre trae uno, TODAS no es un
filtro más estricto, es una **máquina de generar consultas imposibles**.
Un lab que declara solo `detectar` no puede satisfacer "detectar Y
proteger" ni en principio.

Y hay un dato que lo cierra para `categoria`: es un `z.enum`, **un valor
por lab**. Sobre categoría, TODAS con dos marcadas devuelve **siempre**
cero. Aunque cambiaras de opinión para función, categoría tiene que ir en
CUALQUIERA igual.

### Contadores por casilla

Cada casilla muestra cuántos resultados daría. No es adorno: es lo que
hace que marcar no sea a ciegas y lo que vuelve visible el solapamiento
entre categoría y función en vez de convertirlo en trampa.

**El detalle que hace que sirvan:** el número de una casilla se calcula
aplicando **los otros** grupos de filtros pero **no el propio**. Si no,
marcar `detectar` pone en cero a las otras cuatro de su mismo grupo y el
filtro se vuelve monoselección de hecho. Es la regla estándar de facetas
y es fácil implementarla mal.

### Las cinco funciones se muestran siempre

**Nunca `disabled`.** Un `<input disabled>` sale del orden de tabulación:
quien navegue con teclado o lector de pantalla pasa de largo sin enterarse
de que existe. Eso contradice justamente lo que se busca, que se vea que
el eje tiene cinco valores aunque haya labs en tres.

Las que no tienen labs van con **contador en cero**, atenuadas a
`--texto-suave` pero pulsables. Con el contador visible, un cero no es
una trampa: dice "este eje existe, todavía no lo trabajé", que en un
portafolio hasta juega a favor.

### Semántica y teclado

`<fieldset>` + `<legend>` para agrupar, y casillas nativas:

```html
<fieldset>
  <legend class="titulo-seccion">Función (NIST CSF)</legend>
  <input type="checkbox" id="f-detectar" value="detectar">
  <label for="f-detectar">Detectar <span>(9)</span></label>
  …
</fieldset>
```

- El `<legend>` hace que el lector de pantalla anuncie "Función, Detectar,
  casilla, no marcada": nunca se pierde de qué grupo es.
- Tab entre casillas y Espacio para marcar los da el navegador. Sin JS.
- **No con `<button aria-pressed>`.** Se ve igual, pierde la semántica de
  "una de un grupo de opciones" y exige JS para funcionar.
- Para que parezcan chips **estila el `<input>` con `appearance: none`**,
  no lo escondas: con `display: none` sale del orden de tabulación.
- El anillo de foco necesita 3:1 contra lo que tenga al lado, y `--acento`
  cambia entre modos: hay que medirlo en los dos.

### La base es CSS, el JavaScript va encima

Con `:has()` el filtro funciona **entero sin una línea de JS**: mientras no
haya nada marcado se ve todo; en cuanto hay algo marcado se oculta todo y
cada casilla marcada vuelve a mostrar lo suyo.

```css
.filtros:has(input:checked) ~ .lista .fila { display: none; }
.filtros:has(#f-detectar:checked) ~ .lista .fila[data-funcion~="detectar"] { display: revert; }
```

Eso es CUALQUIERA nativo: cada casilla suma sus coincidencias.

**El cruce entre grupos se resuelve anidando**, que es la parte que no es
obvia. Envuelve cada tarjeta en un `<div class="fila" data-funcion="…">` y
deja `data-categoria` en la `.tarjeta` de adentro: las reglas de función
ocultan el envoltorio, las de categoría ocultan la tarjeta, y como
`display: none` en el envoltorio esconde todo lo que lleva dentro, la
tarjeta solo se ve si **pasa las dos**. O sea Y entre grupos y O dentro de
cada grupo, la lógica correcta de facetas, en CSS puro.

Los contadores tampoco necesitan JS: **los contadores de CSS saltan los
elementos con `display: none`**, así que `counter-increment` sobre las
tarjetas visibles más `content: counter(…)` da "N labs" en vivo.

Lo que **sí** queda afuera sin JS:

| | Sin JS | Con ~40 líneas |
| --- | --- | --- |
| Filtrar, Y entre grupos / O dentro | ✅ | ✅ |
| Contador total | ✅ | ✅ |
| Contador por casilla | ❌ | ✅ |
| Estado vacío | ❌ | ✅ |
| URL compartible | ❌ | ✅ |
| Anuncio a lector de pantalla | ❌ | ✅ |

**La fila que más pesa es la última**: sin JS, alguien con lector de
pantalla marca una casilla y no escucha nada; tiene que ir a la lista a
descubrir que cambió. Le funciona, pero a ciegas. Esa —y no la URL— es la
razón concreta de poner la capa de JS encima. Se resuelve con un
`<p role="status">7 labs</p>` arriba de la lista.

### URL

`?funcion=proteger,detectar` — coma, no repetición de clave. Y
`history.replaceState`, **no `pushState`**: con `pushState` cada casilla
que marca el lector se apila en el historial y para volver a la página
anterior tiene que apretar Atrás siete veces.

Límite a tener presente: el sitio es estático en GitHub Pages, no hay
servidor que lea la query string, así que **la URL solo funciona si hay JS
que la lea al cargar**. Un enlace compartido abierto sin JS muestra la
lista completa. Es aceptable —se ve todo, no se ve un error— pero es la
única capa que no degrada.

### Estado vacío

Que no sea `<p>Sin resultados</p>`:

> **Ningún lab combina eso todavía.**
> Estás filtrando por *Detección* y *Proteger*.
> [Quitar los filtros]

Nombra qué está marcado (el lector puede haber olvidado una casilla más
arriba), ofrece la salida en un clic, y dice "todavía": es un portafolio
que crece, no una búsqueda fallida.

### Umbral: no se muestra hasta el sexto lab

```
{labs.length >= 6 && <Filtros … />}
```

Con un lab publicado, el bloque de filtros son 11 controles arriba de
**una** tarjeta: el control pesa más que lo controlado y los contadores
dirían `(0)` en casi todo, que es información honesta pero se lee como un
sitio vacío. Seis es donde el eje más chico deja de ser trivial y la lista
deja de leerse de un vistazo.

### Herramientas y MITRE

`herramientas` queda para los 5-6 labs. Con 20 labs y la lista de
`taxonomia.ts`, ese grupo tendría demasiados valores con 1-2 labs cada
uno; ahí el filtro que sirve es un buscador, no casillas.

`mitre_attack` **parece un eje y no lo es**: es opcional y disperso (solo
`deteccion` y `analisis` lo llevan, por la regla de esta guía), y
"T1059.001" no se escanea. Es material para una **página de índice**
(`/mitre`, la matriz con enlaces a los labs que la tocan), no para el
mismo control.

Y lo que de verdad falta a los 20 labs no es un tercer grupo de casillas
sino un **buscador de texto** sobre título y resumen: resuelve más
consultas reales y cuesta menos interfaz.

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

## Arquitectura

- Astro 7, sin integraciones de framework instaladas. Prácticamente cero
  JavaScript en el cliente: **cero archivos `.js` emitidos**, cero
  dependencias, y dos `<script is:inline>` que son todo lo que corre en el
  navegador:
  - `sobre-mi.astro` — arma el enlace `mailto:` del correo para no
    publicarlo en el HTML estático.
  - `Lab.astro` — marca la sección que se está leyendo en la tabla de
    contenidos, con un `IntersectionObserver`. Es la única parte de la
    barra que necesita JavaScript; el resto funciona sin él.

  Los dos van en línea y no en un archivo aparte a propósito: son de
  decenas de líneas, y una petición HTTP más pesaría más que el código.
- `src/pages/` usa routing basado en archivos: cada archivo es una ruta.
  `labs/[...id].astro` es la ruta dinámica que genera una página por lab.
- `src/lib/labs.ts` es el **único** punto de lectura de la colección. Ahí vive el
  filtrado de borradores y el orden por fecha; no duplicar esa lógica en las páginas.
- `src/lib/toc.ts` decide si un lab lleva tabla de contenidos y cuáles
  encabezados entran. Va aparte de `labs.ts` porque **no importa
  `astro:content`**: es aritmética pura y así se puede verificar con
  `node` sin levantar el sitio. Ver "Tabla de contenidos de un lab".
- `src/content.config.ts` define la colección `labs` con la Content Layer API de
  Astro 5+ (`loader: glob(...)`), no la carpeta mágica de versiones viejas.
- `src/styles/global.css` concentra los tokens de diseño arriba del archivo.
- `public/` contiene assets estáticos servidos tal cual, **sin pasar por
  el filtro de borradores ni por la optimización de imágenes**. `favicon.svg`,
  `logo-circulo.svg` y `og.png` son **generados** — ver "La marca" — y se
  commitean. El `.ico` se borró a propósito para no mantener dos archivos
  sincronizados, y todos los navegadores en uso soportan favicons en SVG.
  Las capturas de los labs **no** van acá: ver "Capturas e imágenes".
- `src/assets/labs/<slug>/` guarda las capturas de cada lab, para que
  Astro las procese en el build.
- `astro.config.mjs` define `site: 'https://achibury.github.io'`, necesario para que las URLs absolutas salgan bien en GitHub Pages. Al ser sitio de usuario (no de proyecto), no lleva `base`.
- `tsconfig.json` extiende el preset `strict` de Astro.
- Despliegue automático: `.github/workflows/deploy.yml` compila con `withastro/action@v3` (Node 22) y publica con `actions/deploy-pages` en cada push a `main`.
- `AGENTS.md` es un hardlink a este archivo: editarlo en su sitio (no reemplazarlo) para que ambos sigan sincronizados. `Write` y `Edit` rompen el enlace; hay que truncar el archivo existente y escribir encima.

## La marca

### Una sola marca, una sola fuente

`src/lib/logo.ts` es la **fuente única**. Ahí vive `GEOMETRIA` (los
números del dibujo) y de ahí sale **todo** lo que muestra la marca:

| Dónde aparece | Cómo llega |
| --- | --- |
| Logo del header | `src/components/Logo.astro` importa `logo.ts` |
| `public/favicon.svg` | generado por `scripts/generar-logo.mjs` |
| `public/logo-circulo.svg` | generado por `scripts/generar-logo.mjs` |
| `public/og.png` | generado por `scripts/generar-og.mjs` |

No hay ningún `d` de SVG escrito a mano en ningún otro archivo. Los
caminos se **calculan** en `logo.ts` a partir de `GEOMETRIA`, así que la
geometría sigue siendo editable y no puede quedar desincronizada de los
parámetros.

**Al cambiar cualquier número de `GEOMETRIA` hay que regenerar:**

```
node scripts/generar-logo.mjs    # favicon.svg y logo-circulo.svg
node scripts/generar-og.mjs      # og.png
```

Los archivos generados se commitean. **No se generan en el build**:
`public/` se copia tal cual, así que si te olvidas de correrlos, el
header cambia y el favicon no. El header en cambio no necesita nada:
importa `logo.ts` y se actualiza solo.

Los dos scripts importan un módulo TypeScript apoyándose en que Node 23+
le saca los tipos solo. El Node local es 24.x. **El CI está fijado en 22
y no podría**, pero no importa: los dos se corren a mano, nunca en el
build.

### Los dos envases

| Envase | Archivo | Para qué |
| --- | --- | --- |
| Cuadrado redondeado, 56% | `favicon.svg` | La pestaña del navegador |
| Círculo, 46% | `logo-circulo.svg` | Avatares (GitHub, LinkedIn) y `og.png` |
| Sin envase | `Logo.astro` | El header |

**Por qué dos y no uno.** El cuadrado deja **16% más de alto de letra**
que el círculo (9,0px contra 7,4px con el favicon a 16px), y a ese
tamaño es la diferencia entre leerse y no leerse. Pero las plataformas
**recortan los avatares a un círculo**, así que ahí el cuadrado se vería
con las esquinas cortadas. Cada envase va donde corresponde. No agregan
carga de mantenimiento: los dos salen del mismo generador.

El techo geométrico del círculo para esta relación de aspecto es 54,5%
del diámetro; el 46% que usamos es el 84% de ese máximo, así que subirlo
aporta poco. Y el 56% del cuadrado ya deja 36 unidades de aire a cada
lado: más grande y el monograma toca el borde redondeado.

### La versión con envase lleva colores fijos A PROPÓSITO

`COLORES_ENVASE` está escrito a mano y **no** usa `currentColor` ni
variables de CSS. No es un olvido:

> Un favicon lo dibuja el navegador y un avatar lo dibuja otro sitio.
> Nuestro CSS no llega a ninguno de los dos, así que `currentColor` no
> tendría contra qué resolverse.

Por eso el envase **trae su propio fondo**: con eso funciona sobre
cualquier superficie, clara u oscura, que es justamente para lo que
existe. Los valores son la paleta del modo oscuro de `global.css`.
Contrastes medidos contra ese fondo: letras **14,48:1**, acento
**12,07:1**.

La que **sí** se adapta al tema es la marca plana del header, y por eso
va **incrustada** y no como `<img src="...">`: `currentColor` se resuelve
contra el documento donde vive el SVG, y en un `<img>` el SVG es su
propio documento. Incrustada hereda el color del texto y `--acento` sin
un solo media query propio.

### El trapecio es estructural, no decoración

El trapecio de acento dentro de la A es **el travesaño de la A**.

**Sin él la A se lee como una Λ.** Está comprobado: se renderizaron las
variantes con y sin trapecio a 16px y sin el travesaño la letra deja de
leerse como A. No lo quites "para simplificar a tamaño chico" — es lo
primero que uno piensa y es exactamente al revés.

### El original y por qué esto es un redibujo

El logo original salió de una IA como imagen y se calcó a vectores
automáticamente: **328 KB** en 69 caminos, 26 colores cuantizados y 9
niveles de opacidad, o sea las bandas de antialiasing del mapa de bits
convertidas en geometría. El redibujo pesa **260 bytes** de camino.

**Se intentó limpiar el calco y no sirve. No lo vuelvas a intentar.**
Se probó máscara a 1px por unidad de viewBox, seguimiento de contornos y
simplificación Ramer-Douglas-Peucker a cuatro tolerancias:

- De **269 contornos**, 267 eran motas.
- Los dientes del borde **no son ruido encima de una forma limpia, SON
  la forma**. Con tolerancia baja quedan los dientes; con tolerancia alta
  se vuelven ondulaciones.
- El peso no bajaba de **13,6 KB**.

El redibujo conserva la relación de aspecto (**1,537** contra 1,535 del
original), los grosores medidos (asta 305 → 60, pata 344 → 66) y el
entrelazado B/A.

### Cuatro defectos del calco que el redibujo corrige

1. **La pared de la panza inferior de la B se adelgazaba a cero** donde
   la cruza la pata de la A, y la contraforma se derramaba en el canal.
2. **Las dos patas de la A tenían ángulos distintos** (0,533 y 0,588),
   así que la A se veía inclinada. Ahora las dos van a 0,56.
3. **El trapecio no seguía las patas** y estaba corrido dentro de la
   contraforma: 61-75 unidades de la pata izquierda contra 98-121 de la
   derecha. Ahora es simétrico por construcción.
4. **Bordes dentados y motas de color** sueltas.

### `pared` es el parámetro que decide si lee "BA" o "PA"

El más delicado de `GEOMETRIA`. Es la pared de la panza inferior de la B,
medida perpendicular, hoy en **20 unidades**.

**Si la bajas a cero, la marca lee "PA".** Sin esa pared la B se queda
con una sola panza arriba, y eso es una P. Se probó y es inequívoco.

Pero tampoco puede ser gruesa: la contraforma inferior es el estadio más
grande que quepa a `pared` de la diagonal, así que **engrosar la pared
angosta la contraforma**, y pasado cierto punto se pierde el entrelazado
con la A. 20 unidades son 1,49px con el logo a 26px y 11,5px a 200px:
fina, pero visible y **continua**. Ese "continua" es todo el punto — lo
que estaba mal en el calco era que llegaba a cero en un punto, no que
fuera fina.

El eje de la A (`Ax: 340`) también está elegido, no es libre: es la única
posición donde la pata izquierda **cierra limpio contra la barra
inferior** (escalón de 6 unidades = 0,45px a 26px). Moviéndola a 352 el
escalón sube a 17,9 y se ve el tope; y más a la derecha la A se separa de
la B y se pierde el entrelazado.

### El alto en el header

**26px.** El header medía 56,8px (línea de 23,8 + 16 de relleno arriba y
abajo + 1 de borde) y pasa a **59px**.

Ese relleno **no es holgura**: los ítems van con `align-items: center`,
así que la fila mide lo que mida el elemento más alto. Todo píxel que el
logo pase de 23,8 estira el header uno a uno. A 40px el header se iría a
73px, un 29% más alto en todo el sitio.

Ojo con un detalle óptico: el texto a 14px tiene mucho aire interno (las
mayúsculas miden ~10px dentro de una caja de 23,8px), mientras que un
logo tiene la caja **entintada entera**. Por eso el logo a 26px se ve
bastante más grande que el menú de al lado aunque su caja sea apenas
mayor que la línea de texto.

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
  recolectores (ver "NO TOCAR" punto 5). Ponerla en un JSON-LD la
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

## Documentación

Documentación completa: https://docs.astro.build

Consultar estas guías antes de trabajar en tareas relacionadas:

- [Agregar páginas, rutas dinámicas o middleware](https://docs.astro.build/en/guides/routing/)
- [Trabajar con componentes Astro](https://docs.astro.build/en/basics/astro-components/)
- [Usar componentes React, Vue, Svelte u otros frameworks](https://docs.astro.build/en/guides/framework-components/)
- [Agregar o gestionar contenido](https://docs.astro.build/en/guides/content-collections/)
- [Agregar estilos o usar Tailwind](https://docs.astro.build/en/guides/styling/)
- [Soportar múltiples idiomas](https://docs.astro.build/en/guides/internationalization/)

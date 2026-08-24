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

## Pendientes

Cosas abiertas a hoy, verificadas contra el código:

- **`/herramientas` es un placeholder.** Dice "Sección en construcción".
- **No existe `public/cv.pdf`**, así que la sección del currículum de
  `/sobre-mi` no se genera. Es a propósito: mejor sin sección que con un
  botón roto. Se activa sola al dejar el PDF ahí.
- **`hayCertificaciones` está en `false`** en `sobre-mi.astro`, porque
  todavía no hay ninguna. El markup ya está escrito esperando.
- Los párrafos de presentación de `/sobre-mi` siguen siendo texto de
  relleno marcado con comentarios `REEMPLAZAR`.
- **V2 — el header envuelve en dos filas a 360px.** Medido con las
  métricas reales de Segoe UI a 14px: el menú completo mide 212px y el
  ancho disponible a 360px es 312px (360 menos 24 de padding por lado).
  Con el nombre en texto (117px) daba 361 y no cabía. Con el logo a 26px
  (40px de ancho) da 284 y **entra en una fila**, así que el logo lo
  mejoró — pero el margen es de 28px y cualquier enlace nuevo en el menú
  lo vuelve a romper. Queda anotado, **no arreglado**: la salida
  probablemente sea un menú colapsable, y eso es una decisión de diseño
  aparte.

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

Siete cosas que **parecen** redundantes o simplificables y no lo son. Cada
una se ve como código que sobra, y en **los siete casos** quitarla rompe
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
| h2 | 28px | 650 | `--texto` | línea separadora arriba |
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

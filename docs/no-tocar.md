# Trece cosas que no se tocan

> Archivo de detalle de [`CLAUDE.md`](../CLAUDE.md) (que es el mismo
> archivo que `AGENTS.md`).
>
> **Léelo antes de:** editar cualquier CSS del sitio o `astro.config.mjs`.
>
> Este es el archivo de detalle más importante de todos, y por un motivo
> concreto: en los trece casos el build **pasa igual** después de romperlo.
> No hay red de seguridad automática; la única red es leer el punto antes
> de tocar. En `CLAUDE.md` está la lista de los trece títulos como alarma,
> pero el motivo, la medición y el "ya pasó una vez" están acá.

## NO TOCAR

Trece cosas que **parecen** redundantes o simplificables y no lo son. Cada
una se ve como código que sobra, y en **los trece casos** quitarla rompe
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

Explicado entero en "Tabla de contenidos de un lab" (`docs/tabla-de-contenidos.md`).

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

### 13. El relleno de 16px de la tabla de contenidos

```css
/* TablaContenidos.astro */
.toc { padding: var(--e-3) var(--e-4) var(--e-4); }   /* 16px a los lados */

/* Lab.astro, dentro del @media de la rejilla */
.lab--con-toc > :global(.toc) { overflow-y: auto; }
```

**Parece** que el relleno de la caja del índice es puro espaciado y se
puede apretar para ganar ancho de texto.

**No: es lo que evita que se recorte el anillo de foco.** La barra lleva
`overflow-y: auto` como red de seguridad para un lab con muchas
secciones, y en CSS declarar un eje como no visible **convierte también
el otro en recortable** — `overflow-x: visible` computa a `auto`. O sea
que la caja recorta a sus hijos en horizontal aunque nadie lo pidiera.

El `:focus-visible` global dibuja el anillo a `outline-offset: 3px`, o
sea 3px **por fuera** del enlace. Esos 3px caen dentro de los 16px de
relleno, así que hoy el anillo se ve entero. Con el relleno en 8px
seguiría entrando; en 0 o en 2px, el anillo del ítem enfocado se corta
contra el borde de la caja y quien navega con teclado pierde la única
señal de dónde está parado.

**El anillo se queda en +3px y NO se baja a −2px** como el de los
controles de contacto de `/sobre-mi`. Ahí el desplazamiento negativo
hace falta porque el contenedor tiene `overflow: hidden` de verdad y no
hay relleno que absorba nada; acá sí lo hay, y un anillo distinto al del
resto del sitio sería una inconsistencia sin motivo.

Es de manual para esta lista: parece espaciado cambiable, no lo es, y el
build no dice absolutamente nada. Ver "Tabla de contenidos de un lab"
(`docs/tabla-de-contenidos.md`).

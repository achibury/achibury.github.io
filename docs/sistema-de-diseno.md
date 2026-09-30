# Estilos: sistema de diseño y bloques de código

> Archivo de detalle de [`CLAUDE.md`](../CLAUDE.md) (que es el mismo
> archivo que `AGENTS.md`).
>
> **Léelo antes de:** tocar colores, tipografía, espaciado, `global.css`
> o el resaltado de código.
>
> Antes de cambiar cualquier color, la regla de contraste 4.5:1 de
> `CLAUDE.md` sigue vigente. Y antes de "ordenar" cualquier regla que te
> parezca redundante, pasa por [`no-tocar.md`](no-tocar.md).

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
del artículo. Ver "Tabla de contenidos de un lab" (`docs/tabla-de-contenidos.md`).

### Tipografía

Escala `--t-xs` … `--t-2xl` (12 / 14 / 16 / 18 / 21 / 28 / 36 px) más
`--t-mono: 0.9em` para código.

Por encima hay un paso más, **`--t-3xl` (48px)**, que **no** es para
encabezados: lo usa solo el nombre de la home, y solo en escritorio (ver
"La fuente del nombre"). Todos los `h1` del sitio siguen en `--t-2xl`.
Sigue el ritmo de la parte alta de la escala: 21 → 28 → 36 → 48 crece
~1,3 por paso. Se evaluó 44px (2.75rem), más discreto, y se eligió 48
por no romper ese ritmo.

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
que no esté en esa lista, comprueba que se vea: si pides 500 esperando
"un poco más que normal", no vas a obtener nada.

Por eso el menú del header usa 600 en reposo y 700 en el activo, no 500 y
600.

### La fuente del nombre (la única excepción)

Todo el sitio va en `--fuente`, las fuentes del sistema. **Una sola cosa
no**: el `h1` con el nombre en la home, que va en **Outfit**. Nada más la
usa: ni el perfil ni la frase de la bienvenida, ni los `h1` de las otras
páginas.

**Por qué Outfit.** Es la tipografía más cercana a la construcción del
monograma: la B de Outfit es barra recta más semicírculo, igual que la
panza de la B en `logo.ts`, y su A termina en punta, como la del
monograma. Se eligió viendo cuatro candidatas con cuatro animaciones en un
prototipo (Archivo, Encode Sans, Outfit y Sora); el prototipo y sus
capturas están en `notas/v3/`, que no se versiona.

**Por qué solo el `h1` de la home.** Es el único lugar donde el nombre es
el contenido. Llevar la fuente a más textos obligaría a traer el alfabeto
entero (decenas de KB en vez de 4), y con eso a cargarla en todas las
páginas.

**El recorte.** `public/fuentes/outfit-nombre.woff2` trae **solo** las
letras de "Benjamin Achibury": 15 caracteres distintos, **3.948 bytes**.
Es variable en peso (100 a 900), así que cualquier peso de ese rango se ve
de verdad: acá el 500 y el 650 **sí** existen, al revés que en Segoe UI.
La licencia (OFL 1.1) va al lado, en `public/fuentes/OFL-Outfit.txt`.

Lo genera `node scripts/generar-fuente.mjs`, a mano, como los otros
`generar-*`. **Si cambia el nombre del `h1`, hay que volver a correrlo**:
una letra que no esté en el recorte se dibuja con otra fuente, en medio
del nombre, y el build no avisa. El script lee el `h1` de la home y se
niega a seguir si no coincide con el texto que recorta.

**Cómo se carga**, tres piezas que van juntas:

| Pieza | Dónde | Qué hace |
| --- | --- | --- |
| `<link rel="preload" as="font" crossorigin>` | `index.astro`, por el hueco `head` de `Base.astro` | Pide la fuente junto con el CSS, antes de que el navegador encuentre el `h1` |
| `@font-face` con `font-display: optional` | `<style>` de `index.astro` | Si la fuente no está lista en ~100ms, esa visita usa `--fuente` entera y **nunca** cambia a mitad de camino |
| `font-weight: 100 900` en el `@font-face` | ídem | Le avisa al navegador que un solo archivo cubre todos los pesos |

La precarga va **solo en la home**: ponerla en `Base.astro` haría que las
seis páginas bajaran una fuente que usa una. Verificado en la pestaña
Network: la home la baja una vez; `/labs`, un lab y `/sobre-mi`, ninguna.

`crossorigin` no sobra aunque la fuente sea del mismo sitio: las fuentes
se piden siempre en modo CORS, y una precarga sin ese atributo no
coincide con el pedido real, así que la fuente se bajaría dos veces.

**Qué se ve si la fuente no llega a tiempo.** Con `optional`, la fuente
del sistema, durante toda esa visita, sin redibujo. Medido en Chrome:

| Caso | El `h1` se pinta con | CLS |
| --- | --- | --- |
| Red normal | Outfit | 0 |
| Slow 4G, sin caché | Outfit (la precarga la trae junto con el CSS) | 0 |
| Fuente retenida 2 s | Segoe UI, y se queda en Segoe UI aunque la fuente llegue | 0 |
| Fuente bloqueada | Segoe UI | 0 |

**El tamaño.** El nombre crece con el ancho de la pantalla, entre dos
pasos de la escala: 36px (`--t-2xl`) en móvil y 48px (`--t-3xl`) en
escritorio.

```css
font-size: clamp(var(--t-2xl), var(--t-xl) + 1.7857vw, var(--t-3xl));
```

`clamp(mínimo, preferido, máximo)` usa el valor del medio, pero nunca
menos que el primero ni más que el último. El del medio está calculado
para que el crecimiento empiece en 28rem (448px, donde termina la regla
de una palabra por línea) y termine en 70rem (1120px, el ancho máximo del
contenedor): a 448px da 28 + 8 = 36, y a 1120px, 28 + 20 = 48. El 28 es
`--t-xl`, así que los tres valores salen de la escala.

| Ancho de pantalla | Tamaño | Líneas | El nombre mide / espacio útil |
| --- | --- | --- | --- |
| 360 a 440px | 36px | 2 | "Achibury" 148,5px / 312 a 392 |
| 460px | 36,2px | 1 | 312px / 412 |
| 768px | 41,7px | 1 | 360px / 720 |
| 1366px | 48px | 1 | 414px / 1072 |

Por qué creció: con 36px el nombre, que es la presentación del sitio,
apenas se despegaba de los títulos de los labs (21px). En móvil no
cambia: ahí ya ocupa dos líneas y el espacio vertical es lo escaso.

**El espaciado.** Outfit va con `letter-spacing: 0`, su espaciado
natural. El `-0.015em` que `global.css` les pone a los encabezados está
pensado para Segoe UI; con Outfit juntaba las letras de más (el nombre
medía 301px en vez de 310).

**La animación.** El nombre pasa de peso 100 a 700 en 900ms, una vez por
carga, dentro de `@media (prefers-reduced-motion: no-preference)`. Los
tres números están al principio del `<style>` de `index.astro`
(`--nombre-peso-inicial`, `--nombre-peso-final`, `--nombre-duracion`)
para afinarlos cambiando un valor. Empezó en 300 y 700ms, y se bajó a
100 y se alargó a 900ms porque así casi no se notaba. Cuatro cosas que
no son obvias:

- **Compensación de ancho.** Con peso fino las letras son más angostas.
  El espaciado arranca en **0.0309em** (medido en Chrome con el archivo
  real) para que el nombre mida lo mismo al principio y al final, y
  termina en 0. Durante el camino queda algo más angosto, porque el
  ancho no crece en línea recta con el peso: hasta **4,45px** a 36px y
  **5,94px** a 48px (crece en proporción con la letra). Como está en
  `em`, el valor no depende del tamaño: medido, da 0.0309em a 36, a 41,7
  y a 48px. Vale solo para el peso inicial 100: si lo cambias, hay que
  volver a medirlo (con 300 era 0.0245em).
- **Una palabra por línea bajo 28rem** (`width: min-content`). Sin esto,
  un nombre justo en el límite de lo que cabe salta de una a dos líneas
  a mitad de la animación y empuja todo lo de abajo. Pasó en el
  prototipo. Con la regla, el nombre va siempre en dos líneas en
  pantallas angostas, también con la fuente de reserva. El corte en
  28rem sigue sirviendo con el tamaño creciente: justo por encima, a
  460px, la versión más ancha (fuente de reserva, a mitad de animación)
  mide 326px de 412 disponibles.
- **`backwards` y no `both`.** Al terminar, la animación suelta el
  elemento. El reposo es **idéntico píxel a píxel** al estado sin
  animación: medido en Chrome y en Firefox, claro y oscuro, a 360 y
  1366px, 0 píxeles distintos.
- **Si la fuente no llega**, la animación corre igual sobre Segoe UI, que
  solo tiene los pesos de la tabla de arriba: el nombre engrosa a saltos
  en vez de gradualmente. Termina igual de quieto y sin mover nada:
  medido con la fuente bloqueada, el alto del nombre no cambia en ningún
  cuadro a 360, 390, 414, 440, 460, 768 ni 1366px (y con Outfit
  tampoco, en los mismos anchos).

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

## Bloques de código

Resaltado con Shiki en tiempo de build: no se envía JavaScript al navegador,
el HTML ya sale coloreado. Dos temas a la vez (`github-light` / `github-dark`);
los colores del claro van escritos en el HTML y los del oscuro llegan en
variables `--shiki-dark` que `global.css` activa por media query.

- **Teclado**: Astro marca los `<pre>` con `tabindex="0"` por su cuenta. Se
  puede entrar al bloque y desplazarlo con las flechas. No hace falta agregar
  nada.
- **Táctil**: nativo del `overflow-x`.
- Ver "NO TOCAR" puntos 2, 3 y 4 (`docs/no-tocar.md`) antes de modificar cualquier cosa acá.


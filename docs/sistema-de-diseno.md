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


# La barra de contenidos de un lab

> Archivo de detalle de [`CLAUDE.md`](../CLAUDE.md) (que es el mismo
> archivo que `AGENTS.md`).
>
> **Léelo antes de:** tocar `src/lib/toc.ts`, `TablaContenidos.astro`, la
> rejilla de dos columnas de `Lab.astro` o el script de sección actual.
>
> Es la parte del sitio con más decisiones medidas por línea de código, y
> la única con JavaScript en el cliente. Los puntos 8, 9, 10 y 11 de
> [`no-tocar.md`](no-tocar.md) son todos de acá.

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
bloque de código, que es lo que la regla de "Capturas e imágenes" (`docs/escribir-labs.md`) ya pide
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
columnas**. Está explicado en "NO TOCAR" punto 11 (`docs/no-tocar.md`), con los números.

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

Ver "NO TOCAR" puntos 8, 9 y 11 (`docs/no-tocar.md`) antes de tocar el ancho o la rejilla.

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


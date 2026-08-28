# El monograma BA

> Archivo de detalle de [`CLAUDE.md`](../CLAUDE.md) (que es el mismo
> archivo que `AGENTS.md`).
>
> **Léelo antes de:** tocar `src/lib/logo.ts`, `Logo.astro`, el favicon,
> `logo-circulo.svg` o `og.png`.
>
> La trampa principal: los archivos de `public/` son **generados** y no se
> regeneran en el build. Si cambias la geometría y no corres los dos
> scripts, el header cambia y el favicon no.

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


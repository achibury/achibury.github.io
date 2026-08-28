# Escribir un lab

> Archivo de detalle de [`CLAUDE.md`](../CLAUDE.md) (que es el mismo
> archivo que `AGENTS.md`).
>
> **Léelo antes de:** escribir o editar un lab, tocar su frontmatter,
> agregar una herramienta a la taxonomía o sumar capturas.
>
> Parte de esto sí tiene red de seguridad: el schema Zod y la taxonomía
> **fallan el build** ante un campo mal escrito. Lo que no la tiene son
> las convenciones de contenido y la regla de las capturas, que es la que
> más cerca estuvo de filtrar un dato real.

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
Ver "NO TOCAR" punto 7 (`docs/no-tocar.md`) antes de tocarlo.

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


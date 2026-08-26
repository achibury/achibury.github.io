import type { MarkdownHeading } from 'astro';

/**
 * Tabla de contenidos de un lab.
 *
 * Decide SI corresponde mostrarla y CUALES encabezados entran. Vive
 * aparte de labs.ts a proposito: labs.ts importa `astro:content`, que
 * solo existe dentro de Astro, y esto es aritmetica pura que conviene
 * poder verificar con `node` sin levantar el sitio.
 */

/**
 * Minimo de secciones (h2) para que la barra tenga sentido.
 *
 * Con menos de 4 la barra es mas alta que util: enumera casi la pagina
 * entera y no ahorra ningun scroll.
 */
export const TOC_MIN_SECCIONES = 4;

/**
 * Minimo de palabras del cuerpo, sin contar los bloques de codigo.
 *
 * ESTE es el umbral que hace el trabajo, y contar encabezados no lo
 * reemplaza. Medido sobre los tres labs del repo:
 *
 *   hardening-router-cisco    8 h2   2125 palabras   -> SI
 *   deteccion-powershell      8 h2    516 palabras   -> no
 *   triaje-memoria            6 h2    516 palabras   -> no
 *
 * Fijate en los dos primeros: MISMA cantidad de h2 y 4 veces menos
 * texto. Contar secciones mide como escribis, no cuanto hay que
 * recorrer. El de PowerShell son ~3 pantallas y la barra le sobra; el
 * de hardening son ~11.700px, unas 13 pantallas, y ahi se paga sola.
 *
 * 1200 es aproximadamente el punto donde un lab pasa las 6 pantallas.
 * El margen es comodo en los dos sentidos (1200 es el 56% de 2125 y
 * mas del doble de 516), asi que no es un valor al filo.
 */
export const TOC_MIN_PALABRAS = 1200;

/**
 * Bloques de codigo cercados, con ``` o con ~~~.
 *
 * Se descuentan del conteo porque 100 lineas de `show running-config`
 * no son carga de lectura: se escanean o se saltan. Lo que decide si
 * hace falta un mapa es cuanta PROSA hay que recorrer.
 */
const CERCAS_DE_CODIGO = /^[ \t]*(?:```|~~~).*$[\s\S]*?^[ \t]*(?:```|~~~)[ \t]*$/gm;

/** Palabras del cuerpo de un lab, descontando los bloques de codigo. */
export function contarPalabras(body: string): number {
  return body.replace(CERCAS_DE_CODIGO, ' ').split(/\s+/).filter(Boolean).length;
}

/**
 * Los encabezados que van en la barra, o una lista VACIA si este lab no
 * lleva barra. Devolver `[]` en vez de un booleano deja una sola cosa
 * que mirar arriba: si viene vacio, no se dibuja nada y la pagina se
 * arma a una sola columna.
 *
 * SOLO h2, nunca h3. No es por gusto:
 *
 *   - El lab de hardening tiene 8 h2 y 20 h3. Los 28 juntos miden
 *     773px de alto, o sea que la barra fija necesitaria su propio
 *     scroll: una tabla de contenidos que hay que desplazar para leer
 *     deja de ser un mapa. Solo los h2 son 221px y entran de sobra.
 *   - No entran a lo ancho. En una barra de 240px, el h2 mas largo
 *     ("Revision de la configuracion final") mide 203px y va en una
 *     linea; el h3 mas largo mide 263px y se parte en dos.
 *
 * Los h1 quedan fuera por otro motivo: el unico h1 de la pagina es el
 * titulo del lab, y un indice no se lista a si mismo.
 */
export function encabezadosParaTOC(
  headings: MarkdownHeading[],
  body: string,
): MarkdownHeading[] {
  const secciones = headings.filter((h) => h.depth === 2);

  if (secciones.length < TOC_MIN_SECCIONES) return [];
  if (contarPalabras(body) < TOC_MIN_PALABRAS) return [];

  return secciones;
}

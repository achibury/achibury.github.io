import { getCollection, type CollectionEntry } from 'astro:content';

export type Lab = CollectionEntry<'labs'>;

/**
 * Unico punto desde donde se leen los labs en todo el sitio.
 *
 * Por que existe este archivo: la regla "los borradores no se publican"
 * tiene que aplicarse en TRES lugares (home, listado y pagina de detalle).
 * Si la copiaramos en los tres, tarde o temprano uno queda desactualizado
 * y se te publica un borrador sin querer. Aca esta escrita una sola vez.
 *
 * En `npm run dev` los borradores SI se muestran, para que puedas
 * previsualizarlos mientras escribes. En `npm run build` (produccion)
 * se filtran siempre.
 */
export async function getLabsPublicados(): Promise<Lab[]> {
  const labs = await getCollection('labs', ({ data }) => {
    return import.meta.env.PROD ? data.borrador === false : true;
  });

  // Mas recientes primero.
  return labs.sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime());
}

/** Cuantos labs entran en la portada. */
const MAX_LABS_HOME = 3;

/**
 * Cuantas herramientas muestra una tarjeta EN LA PORTADA antes de
 * resumir el resto como "+N".
 *
 * Cuatro y no seis porque a 360px de ancho entran dos por fila: cuatro
 * dan dos filas parejas, y a partir de ahi el bloque de chips pesa tanto
 * como el resumen y la jerarquia de la tarjeta se da vuelta.
 *
 * Vive aca, junto a MAX_LABS_HOME, porque los dos son lo mismo: cuanto
 * de la coleccion muestra la portada. /labs no usa ninguno de los dos,
 * y por eso el recorte NO es el comportamiento por defecto de la
 * tarjeta, sino algo que la home pide.
 */
export const MAX_HERRAMIENTAS_HOME = 4;

/** Lo que la home necesita saber, resuelto de una sola lectura. */
export interface SeleccionHome {
  /** Los labs a mostrar, ya recortados y sin repetidos. */
  labs: Lab[];
  /** Total de labs publicados. Sale del mismo filtro que `labs`. */
  total: number;
  /**
   * Si la portada se esta quedando corta y el enlace a /labs aporta.
   *
   * Es false cuando la home ya muestra TODOS los labs publicados: ahi el
   * enlace mandaria a una pagina con exactamente lo mismo que el lector
   * ya tiene delante. Hoy en produccion hay 1 lab, asi que este es el
   * caso real y los dos enlaces no se renderizan.
   */
  hayMas: boolean;
}

/**
 * Que labs muestra la portada.
 *
 * `destacado` FIJA un lab arriba; no reemplaza al resto. El orden es:
 *
 *   1. Los destacados, del mas nuevo al mas viejo.
 *   2. Los no destacados, del mas nuevo al mas viejo, hasta completar 3.
 *
 * Las dos listas son las dos mitades de una misma particion (`destacado`
 * es true o es false, nunca las dos), asi que concatenarlas no puede
 * repetir un lab. No hace falta deduplicar.
 *
 * Los casos de borde salen solos de ese orden, sin condicionales:
 *
 *   - Ningun destacado -> quedan los 3 mas recientes.
 *   - Un destacado -> ese y los 2 mas recientes que le siguen. Este era
 *     el caso que antes quedaba sin definir: la version vieja mostraba
 *     UN lab en la portada y escondia el resto.
 *   - Cuatro o mas destacados -> los 3 mas recientes de entre ellos, y
 *     ningun no destacado alcanza a entrar.
 *   - Menos de 3 labs en total -> los que haya; `slice` no rellena.
 *
 * Las dos mitades heredan el orden por fecha de getLabsPublicados(): acá
 * no se vuelve a ordenar nada.
 *
 * Devuelve tambien `total` y `hayMas` para que la pagina no tenga que
 * volver a leer la coleccion ni comparar nada: `total` es el numero que
 * va en el texto del enlace y `hayMas` es la condicion que decide si el
 * enlace existe. Esa es la razon de que esto devuelva un objeto y no una
 * lista: la home no debe tocar getCollection ni recontar por su cuenta.
 *
 * `total` sale de getLabsPublicados(), o sea del MISMO filtro que arma
 * la lista: no cuenta archivos del disco y no incluye borradores.
 */
export async function getLabsHome(): Promise<SeleccionHome> {
  const todos = await getLabsPublicados();
  const destacados = todos.filter((lab) => lab.data.destacado);
  const resto = todos.filter((lab) => !lab.data.destacado);

  return {
    labs: [...destacados, ...resto].slice(0, MAX_LABS_HOME),
    total: todos.length,
    hayMas: todos.length > MAX_LABS_HOME,
  };
}

/**
 * Etiquetas legibles para los campos del frontmatter.
 *
 * En el .md se escribe en minuscula y sin tildes (mas comodo de tipear y
 * no rompe nada); lo que se muestra en pantalla sale de estos mapas.
 *
 * El tipo Record<...> los ata al schema: si agregas una categoria en
 * content.config.ts y te olvidas de la etiqueta aca, TypeScript se queja.
 */
export const ETIQUETAS_CATEGORIA: Record<Lab['data']['categoria'], string> = {
  infraestructura: 'Infraestructura',
  deteccion: 'Detección',
  analisis: 'Análisis',
  herramienta: 'Herramienta',
  cumplimiento: 'Cumplimiento',
  notas: 'Notas',
};

/** Funciones del NIST CSF 2.0, tal como se muestran en el detalle del lab. */
export const ETIQUETAS_FUNCION: Record<string, string> = {
  identificar: 'Identificar',
  proteger: 'Proteger',
  detectar: 'Detectar',
  responder: 'Responder',
  recuperar: 'Recuperar',
};

/** Formatea una fecha como "14 de marzo de 2026". */
export function formatearFecha(fecha: Date): string {
  return fecha.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

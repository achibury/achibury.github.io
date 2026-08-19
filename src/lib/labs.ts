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

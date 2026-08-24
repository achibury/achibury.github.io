import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { HERRAMIENTAS, FUNCIONES } from './content/taxonomia';

/**
 * Coleccion "labs".
 *
 * El `loader` le dice a Astro DONDE estan los archivos: todos los .md
 * dentro de src/content/labs/. El nombre del archivo (sin .md) se
 * convierte en el `id`, que es lo que despues aparece en la URL:
 * src/content/labs/mi-lab.md  ->  /labs/mi-lab
 *
 * El `schema` valida el frontmatter (el bloque --- del principio de cada
 * .md). Si un lab tiene un campo mal escrito o le falta uno obligatorio,
 * el build FALLA con un mensaje claro en vez de publicar algo roto.
 * Eso es a proposito: es tu red de seguridad.
 */
const labs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/labs' }),
  schema: z.object({
    titulo: z.string(),
    resumen: z.string(),
    // z.coerce.date() acepta la fecha como 2026-03-14 en el frontmatter
    // y la convierte en un objeto Date real, para poder ordenar por ella.
    fecha: z.coerce.date(),

    categoria: z.enum([
      'infraestructura',
      'deteccion',
      'analisis',
      'herramienta',
      'cumplimiento',
      'notas',
    ]),

    // Validado contra la lista canonica de taxonomia.ts: si escribis una
    // herramienta que no esta ahi, el build falla y te muestra las
    // opciones validas. Es lo que evita tener "Elastic" y "Elastic Stack"
    // conviviendo como si fueran cosas distintas.
    herramientas: z.array(z.enum(HERRAMIENTAS)).default([]),

    // OPCIONAL. Usar unicamente en labs de categoria `deteccion` o
    // `analisis`, y solo con las tecnicas que el lab realmente trabaja.
    // Listar tecnicas que apenas se mencionan infla el mapeo y le quita
    // valor al que si corresponde. Si no lo declaras, la fila no aparece.
    mitre_attack: z.array(z.string()).optional(),

    // OPCIONAL. Funciones del NIST CSF 2.0 que cubre el lab.
    funcion: z.array(z.enum(FUNCIONES)).optional(),

    // OPCIONAL. Fecha de la ultima edicion de fondo del lab.
    //
    // No es para correcciones de tipeo: es para cuando el contenido
    // cambia de verdad (se agrega un hallazgo, se corrige una conclusion,
    // se rehace una prueba). Si esta, se emite como `dateModified` en los
    // datos estructurados; si no esta, la propiedad no aparece.
    //
    // Se escribe igual que `fecha`: actualizado: 2026-09-01
    actualizado: z.coerce.date().optional(),

    // Si es true, el lab existe en el repo pero NO se publica en el sitio.
    borrador: z.boolean().default(false),
  })
    // Un `dateModified` anterior al `datePublished` no tiene sentido y los
    // buscadores lo tratan como dato sucio. Mejor que falle el build con
    // un mensaje claro que publicarlo.
    .refine((d) => !d.actualizado || d.actualizado >= d.fecha, {
      message: '`actualizado` no puede ser anterior a `fecha`.',
      path: ['actualizado'],
    }),
});

export const collections = { labs };

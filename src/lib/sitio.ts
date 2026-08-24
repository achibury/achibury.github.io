/**
 * Datos del sitio que se usan en mas de un lugar.
 *
 * Existe para que el nombre no este escrito a mano en cinco archivos.
 * Lo consumen Base.astro (titulo de pestana, meta author, og:site_name,
 * og:image:alt), Lab.astro y sobre-mi.astro (los datos estructurados).
 *
 * La URL del sitio NO va aca: sale de `Astro.site` (astro.config.mjs),
 * que es la fuente para eso y ya la usan el canonical y Open Graph.
 */

/** Nombre del autor, tal como se publica. */
export const AUTOR = 'Benjamin Achibury';

/**
 * Perfiles publicos, para el `sameAs` de los datos estructurados.
 *
 * Solo lo que el sitio ya publica. El correo NO va aca ni en los datos
 * estructurados: la pagina de contacto lo parte a proposito para que no
 * lo barran los recolectores (ver "NO TOCAR" punto 5 en CLAUDE.md), y
 * ponerlo en un JSON-LD lo entregaria en bandeja.
 */
export const PERFILES = ['https://www.linkedin.com/in/benjamin-achibury/'];

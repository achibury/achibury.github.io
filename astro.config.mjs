import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://achibury.github.io',

  integrations: [
    /**
     * Genera sitemap-index.xml y sitemap-0.xml en el build.
     *
     * Solo lista paginas que EXISTEN en dist/, asi que los labs en
     * borrador quedan fuera solos: como no se genera su pagina, no hay
     * nada que listar. No hace falta filtrarlos a mano.
     *
     * El filtro de abajo saca la pagina 404: es una respuesta de error,
     * no contenido, y no tiene por que aparecer en el mapa del sitio.
     */
    sitemap({
      filter: (pagina) => !pagina.endsWith('/404/'),
    }),
  ],

  markdown: {
    // Resaltado de sintaxis de los bloques de codigo en los labs.
    // Astro lo hace en tiempo de build con Shiki: NO se envia JavaScript
    // al navegador, el HTML ya sale coloreado.
    //
    // Nota: Astro 7 marca los <pre> con tabindex="0" por su cuenta, asi
    // que los bloques ya son alcanzables y desplazables con el teclado.
    shikiConfig: {
      // Dos temas a la vez. Shiki escribe los colores del tema claro
      // en el HTML y los del oscuro en variables CSS (--shiki-dark),
      // que global.css activa cuando el sistema esta en modo oscuro.
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: 'light',

      // wrap: false = las lineas largas NO se cortan.
      //
      // Es deliberado. Con wrap: true, Shiki mete `white-space: pre-wrap`
      // y cualquier salida tabular (la tabla de `pslist`, un `ls -l`, una
      // cabecera con guiones) se parte en dos renglones en pantallas
      // angostas y deja de leerse como tabla. Se prefiere conservar el
      // formato original y que el usuario deslice: el scroll horizontal
      // esta estilado en global.css para que se vea siempre.
      wrap: false,
    },
  },
});

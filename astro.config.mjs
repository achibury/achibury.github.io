import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://achibury.github.io',

  markdown: {
    // Resaltado de sintaxis de los bloques de código en los labs.
    // Astro lo hace en tiempo de build con Shiki: NO se envía JavaScript
    // al navegador, el HTML ya sale coloreado.
    shikiConfig: {
      // Dos temas a la vez. Shiki escribe los colores del tema claro
      // en el HTML y los del oscuro en variables CSS (--shiki-dark),
      // que global.css activa cuando el sistema está en modo oscuro.
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: 'light',
      // Las líneas largas se cortan en vez de generar scroll horizontal.
      wrap: true,
    },
  },
});

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Portafolio de ciberseguridad defensiva. Astro estático, desplegado en GitHub Pages en https://achibury.github.io
Sitio de usuario: NO lleva `base` en astro.config.mjs.

## Contexto del autor

Estudiante de ingeniería en ciberseguridad, Chile. Perfil blue team.
NO soy desarrollador web: explica las decisiones de código y no asumas conocimiento de frontend.

## Entorno

- Node local: 24.x
- Node en CI: fijado a 22 en `.github/workflows/deploy.yml`
- `package.json` declara `engines.node: ">=22.12.0"`
- Si el build pasa local pero falla en Actions, revisar primero paridad de versiones de Node

## Convenciones

- Todo el contenido visible en español
- Labs en `src/content/labs/` como Markdown
- Astro puro, sin frameworks de UI innecesarios
- Commits en español, descriptivos

## Reglas

- Antes de dar por bueno un cambio, correr `npm run build`
- Nunca commitear capturas sin que yo confirme que están sanitizadas
- Español de Chile. Imperativo con tú ("reemplaza", "revisa"),
  nunca voseo rioplatense ("reemplazá", "revisá").

## Comandos

```
npm install              # instalar dependencias
astro dev --background   # levantar el servidor de desarrollo (ver abajo)
npm run build            # compilar el sitio de producción a ./dist/
npm run preview          # previsualizar el build de producción en local
```

No hay suite de tests ni linter configurados en este repo. `npm run build` es la
verificación real: valida el frontmatter de todos los labs contra el schema Zod
y falla si algo no cuadra.

`npm run astro check` (chequeo de tipos) necesita instalar antes `@astrojs/check`
y `typescript`, que todavía no están instalados.

Al iniciar el servidor de desarrollo, usar modo background:

```
astro dev --background
```

Gestionar el servidor en background con `astro dev stop`, `astro dev status` y `astro dev logs`.

## Arquitectura

- Astro 7, sin integraciones de framework instaladas. Prácticamente cero
  JavaScript en el cliente: la única excepción es un `<script is:inline>` de
  siete líneas en `sobre-mi.astro`, que arma el enlace `mailto:` del correo
  en el navegador para no publicarlo en el HTML estático.
- `src/pages/` usa routing basado en archivos: cada archivo es una ruta.
  `labs/[...id].astro` es la ruta dinámica que genera una página por lab.
- `src/lib/labs.ts` es el **único** punto de lectura de la colección. Ahí vive el
  filtrado de borradores y el orden por fecha; no duplicar esa lógica en las páginas.
- `src/content.config.ts` define la colección `labs` con la Content Layer API de
  Astro 5+ (`loader: glob(...)`), no la carpeta mágica de versiones viejas.
- `src/layouts/Base.astro` envuelve todas las páginas y **contiene el `noindex`**
  que hay que quitar antes de publicar.
- `src/styles/global.css` concentra los tokens de diseño arriba del archivo;
  reestilizar debería ser mayormente cambiar ese bloque.
- `public/` contiene assets estáticos servidos tal cual (favicons e imágenes).
- `astro.config.mjs` define `site: 'https://achibury.github.io'`, necesario para que las URLs absolutas salgan bien en GitHub Pages. Al ser sitio de usuario (no de proyecto), no lleva `base`.
- `tsconfig.json` extiende el preset `strict` de Astro.
- Despliegue automático: `.github/workflows/deploy.yml` compila con `withastro/action@v3` (Node 22) y publica con `actions/deploy-pages` en cada push a `main`.
- `AGENTS.md` es un hardlink a este archivo: editarlo en su sitio (no reemplazarlo) para que ambos sigan sincronizados.

## Documentación

Documentación completa: https://docs.astro.build

Consultar estas guías antes de trabajar en tareas relacionadas:

- [Agregar páginas, rutas dinámicas o middleware](https://docs.astro.build/en/guides/routing/)
- [Trabajar con componentes Astro](https://docs.astro.build/en/basics/astro-components/)
- [Usar componentes React, Vue, Svelte u otros frameworks](https://docs.astro.build/en/guides/framework-components/)
- [Agregar o gestionar contenido](https://docs.astro.build/en/guides/content-collections/)
- [Agregar estilos o usar Tailwind](https://docs.astro.build/en/guides/styling/)
- [Soportar múltiples idiomas](https://docs.astro.build/en/guides/internationalization/)

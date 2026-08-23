/**
 * Genera public/og.png (1200x630), la imagen de vista previa que muestran
 * LinkedIn, WhatsApp y Slack al compartir el sitio.
 *
 * Se ejecuta a mano cuando cambie el nombre o la linea de posicionamiento:
 *   node scripts/generar-og.mjs
 *
 * Usa sharp, que ya viene instalado porque Astro lo usa para optimizar
 * imagenes. No agrega ninguna dependencia nueva.
 *
 * Los colores salen de la paleta de src/styles/global.css (modo oscuro).
 */
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const FONDO = '#0f172a'; // --fondo
const TEXTO = '#e2e8f0'; // --texto
const SUAVE = '#94a3b8'; // --texto-suave
const ACENTO = '#5eead4'; // --acento

const NOMBRE = 'Benjamin Achibury';
const LINEA = 'Portafolio de ciberseguridad defensiva';
const SITIO = 'achibury.github.io';

const FUENTE = "'Segoe UI', system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="${FONDO}"/>

  <!-- unico adorno: una regla corta de acento sobre el nombre -->
  <rect x="90" y="238" width="88" height="4" rx="2" fill="${ACENTO}"/>

  <text x="90" y="358" font-family="${FUENTE}" font-size="74" font-weight="700"
        letter-spacing="-1.5" fill="${TEXTO}">${NOMBRE}</text>

  <text x="90" y="424" font-family="${FUENTE}" font-size="32" font-weight="400"
        fill="${SUAVE}">${LINEA}</text>

  <text x="90" y="546" font-family="${FUENTE}" font-size="24" font-weight="500"
        fill="${ACENTO}">${SITIO}</text>
</svg>`;

const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
writeFileSync('public/og.png', png);

const meta = await sharp(png).metadata();
console.log(`  public/og.png  ${meta.width}x${meta.height}  ${(png.length / 1024).toFixed(1)} KB`);

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
 *
 * La marca sale de src/lib/logo.ts, la misma fuente que el header y el
 * favicon, asi que no puede quedar desincronizada. Va en el envase
 * circular porque es el mismo que usan los avatares: la tarjeta social y
 * la foto de perfil se ven una al lado de la otra en LinkedIn.
 *
 * Nota: este script importa un modulo TypeScript apoyandose en que Node
 * 23+ le saca los tipos solo. El Node local es 24.x. El CI esta fijado
 * en 22 y no podria, pero no importa: esto se corre a mano.
 */
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { MARCA, ENVASES, centrarEnCuadrado, COLORES_ENVASE } from '../src/lib/logo.ts';

const FONDO = '#0f172a'; // --fondo
const TEXTO = '#e2e8f0'; // --texto
const SUAVE = '#94a3b8'; // --texto-suave
const ACENTO = '#5eead4'; // --acento

const NOMBRE = 'Benjamin Achibury';
const LINEA = 'Portafolio de ciberseguridad defensiva';
const SITIO = 'achibury.github.io';

const FUENTE = "'Segoe UI', system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif";

// La marca, en el mismo envase circular que los avatares.
const LADO = 132;
const { transform } = centrarEnCuadrado(LADO, ENVASES.circulo.fraccion);
const marca = `<g transform="translate(978 74)">
    <circle cx="${LADO / 2}" cy="${LADO / 2}" r="${LADO / 2}" fill="${COLORES_ENVASE.letra}" fill-opacity="0.06"/>
    <g transform="${transform}">
      <path d="${MARCA.monograma}" fill="${COLORES_ENVASE.letra}"/>
      <path d="${MARCA.trapecio}" fill="${COLORES_ENVASE.acento}"/>
    </g>
  </g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="${FONDO}"/>

  ${marca}

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

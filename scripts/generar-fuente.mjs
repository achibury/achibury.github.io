/**
 * Genera la fuente del nombre de la home: un recorte de Outfit que trae
 * SOLO las letras de TEXTO.
 *
 *     node scripts/generar-fuente.mjs
 *
 * Escribe:
 *   public/fuentes/outfit-nombre.woff2   el recorte, variable en peso
 *   public/fuentes/OFL-Outfit.txt        la licencia (SIL Open Font License 1.1)
 *
 * Los dos se commitean. Igual que generar-logo.mjs y generar-og.mjs, esto
 * se corre A MANO y no en el build: public/ se copia tal cual.
 *
 * ---------------------------------------------------------------------
 * SI CAMBIA EL NOMBRE DEL h1 DE LA HOME, HAY QUE VOLVER A CORRER ESTO.
 *
 * El archivo trae únicamente los caracteres de TEXTO. Una letra que no
 * esté acá no existe en la fuente, y el navegador la dibuja con la fuente
 * de reserva: queda una letra distinta en medio del nombre, y el build no
 * avisa. Por eso el script lee src/pages/index.astro y se niega a seguir
 * si el h1 no dice exactamente TEXTO.
 * ---------------------------------------------------------------------
 *
 * De dónde sale: la API de Google Fonts, con el parámetro `text=`, que
 * devuelve un woff2 con solo esos caracteres. Se pide el eje de peso
 * entero (100 a 900) y no solo el tramo que usa la animación: medido,
 * pedir solo 300 a 700 pesaba exactamente lo mismo (3.948 bytes), así
 * que el rango completo permite afinar los pesos en el CSS sin
 * regenerar nada. Pasó: el peso inicial se bajó de 300 a 100 sin tocar
 * la fuente.
 *
 * Sin dependencias: Node 22+ trae fetch. Ojo con un detalle: Google
 * decide el formato según el navegador que pide (el "User-Agent"). Con
 * el de Node devuelve TTF; con uno de Chrome, woff2. Por eso el script se
 * presenta como Chrome.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

/** El texto que se recorta. Tiene que ser IGUAL al h1 de la home. */
const TEXTO = 'Benjamin Achibury';

const FAMILIA = 'Outfit';
const EJE_PESO = '100..900';
const SALIDA_FUENTE = 'public/fuentes/outfit-nombre.woff2';
const SALIDA_LICENCIA = 'public/fuentes/OFL-Outfit.txt';
const URL_LICENCIA = 'https://raw.githubusercontent.com/google/fonts/main/ofl/outfit/OFL.txt';
const COMO_CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

function fallar(mensaje) {
  console.error(`\n  ERROR: ${mensaje}\n`);
  process.exit(1);
}

// 1. El h1 de la home tiene que decir exactamente TEXTO.
const home = readFileSync('src/pages/index.astro', 'utf8');
const h1 = home.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
if (!h1) fallar('no encontré un <h1> en src/pages/index.astro.');
if (h1[1].trim() !== TEXTO) {
  fallar(
    `el h1 de la home dice "${h1[1].trim()}" y este script recorta "${TEXTO}".\n` +
      '  Cambia TEXTO en scripts/generar-fuente.mjs y vuelve a correrlo.',
  );
}

// 2. Pedir el CSS a Google Fonts: trae la URL del woff2 recortado.
const urlCss =
  `https://fonts.googleapis.com/css2?family=${FAMILIA}:wght@${EJE_PESO}` +
  `&text=${encodeURIComponent(TEXTO)}`;
const css = await (await fetch(urlCss, { headers: { 'User-Agent': COMO_CHROME } })).text();
const urls = [...css.matchAll(/url\((https:[^)]+)\)\s*format\('woff2'\)/g)].map((m) => m[1]);
if (urls.length !== 1) fallar(`esperaba 1 archivo woff2 en la respuesta y llegaron ${urls.length}:\n${css}`);

// 3. Bajar el recorte y comprobar que de verdad es un woff2.
const fuente = Buffer.from(await (await fetch(urls[0])).arrayBuffer());
if (fuente.subarray(0, 4).toString('latin1') !== 'wOF2') fallar('lo que bajó no es un woff2.');

// 4. La licencia. La OFL pide que viaje junto a la fuente.
const licencia = await (await fetch(URL_LICENCIA)).text();
if (!licencia.includes('SIL Open Font License')) fallar('lo que bajó como licencia no es la OFL.');

mkdirSync('public/fuentes', { recursive: true });
writeFileSync(SALIDA_FUENTE, fuente);
writeFileSync(SALIDA_LICENCIA, licencia);

const unicos = [...new Set(TEXTO)].sort().join('');
console.log(`  ${SALIDA_FUENTE.padEnd(36)} ${String(fuente.length).padStart(5)} B  ${FAMILIA}, peso ${EJE_PESO}`);
console.log(`  ${SALIDA_LICENCIA.padEnd(36)} ${String(licencia.length).padStart(5)} B  SIL Open Font License 1.1`);
console.log(`\n  recorta "${TEXTO}" (${unicos.length} caracteres distintos: "${unicos}")`);
console.log(`  origen: ${urls[0]}`);
console.log('  si cambia el nombre del h1 de la home, vuelve a correr este script.');

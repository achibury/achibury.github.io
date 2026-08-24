/**
 * Genera los archivos estáticos de la marca a partir de src/lib/logo.ts.
 *
 *     node scripts/generar-logo.mjs
 *
 * Escribe:
 *   public/favicon.svg        envase cuadrado redondeado, para la pestaña
 *   public/logo-circulo.svg   envase circular, para avatares y descarga
 *
 * Los dos se commitean, igual que public/og.png. Hay que volver a correr
 * esto cada vez que cambie GEOMETRIA en src/lib/logo.ts, porque estos
 * archivos NO se generan en el build: public/ se copia tal cual.
 *
 * El header no aparece en esta lista y es a propósito: importa logo.ts
 * directamente, así que se actualiza solo.
 *
 * Nota sobre el .ts: este script importa un módulo TypeScript apoyándose
 * en que Node 23+ le saca los tipos solo. El Node local es 24.x así que
 * anda. El CI está fijado en 22 y NO podría, pero no importa: esto se
 * corre a mano, nunca en el build.
 */
import { writeFileSync } from 'node:fs';
import { svgConEnvase, MARCA, ENVASES, centrarEnCuadrado } from '../src/lib/logo.ts';

const salidas = [
  ['public/favicon.svg', 'cuadrado'],
  ['public/logo-circulo.svg', 'circulo'],
];

for (const [ruta, envase] of salidas) {
  const svg = svgConEnvase(envase);
  writeFileSync(ruta, svg);
  const { lado, fraccion } = ENVASES[envase];
  const { alto } = centrarEnCuadrado(lado, fraccion);
  console.log(
    `  ${ruta.padEnd(24)} ${String(svg.length).padStart(4)} B  ` +
      `envase ${envase}, monograma al ${(fraccion * 100).toFixed(0)}% ` +
      `(${alto.toFixed(0)} de ${lado})`,
  );
}

console.log(
  `\n  marca plana: viewBox 0 0 ${MARCA.ancho} ${MARCA.alto}, ` +
    `relación ${(MARCA.ancho / MARCA.alto).toFixed(3)}, ` +
    `${MARCA.monograma.length} B de camino`,
);
console.log('  el header sale de src/lib/logo.ts, no de acá.');

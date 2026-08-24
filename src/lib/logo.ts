/**
 * FUENTE ÚNICA de la marca "BA".
 *
 * Acá vive la geometría del monograma y de acá sale TODO lo demás:
 * el logo del header (src/components/Logo.astro), el favicon, el SVG
 * para avatares y la marca de la tarjeta social (scripts/generar-logo.mjs
 * y scripts/generar-og.mjs).
 *
 * Si cambias un número de GEOMETRIA, hay que volver a correr:
 *
 *     node scripts/generar-logo.mjs
 *
 * porque los archivos de public/ son generados y se commitean. El header
 * no necesita nada: importa este módulo y se actualiza solo en el build.
 *
 * Los caminos se calculan acá en vez de estar escritos a mano para que
 * la geometría siga siendo editable: no hay un `d` pegado que se pueda
 * desincronizar de los parámetros.
 *
 * ---------------------------------------------------------------------
 * POR QUÉ ES UN REDIBUJO Y NO EL ARCHIVO ORIGINAL
 *
 * El logo original salió de una IA como imagen y se calcó a vectores
 * automáticamente. Ese calco pesaba 328 KB en 69 caminos, con 26 colores
 * cuantizados y 9 niveles de opacidad — las bandas de antialiasing del
 * mapa de bits convertidas en geometría. Se intentó limpiarlo (máscara,
 * seguimiento de contornos y simplificación Ramer-Douglas-Peucker) y no
 * sirve: de 269 contornos, 267 eran motas, y los dientes del borde no
 * son ruido encima de una forma limpia, SON la forma. Con tolerancia
 * baja quedan los dientes, con tolerancia alta se vuelven ondulaciones,
 * y el peso no bajaba de 13,6 KB. No lo vuelvas a intentar.
 *
 * Este redibujo conserva la relación de aspecto del original (1,537
 * contra 1,535), los grosores medidos (asta 305 → 60, pata 344 → 66) y
 * el entrelazado B/A. Corrige cuatro defectos del calco:
 *
 *   1. La pared de la panza inferior de la B se adelgazaba a CERO donde
 *      la cruza la pata de la A, y la contraforma se derramaba en el
 *      canal. Acá la pared es fina pero CONTINUA (20 unidades).
 *   2. Las dos patas de la A tenían ángulos distintos (0,533 y 0,588).
 *      Acá las dos van a 0,56.
 *   3. El trapecio no seguía las patas y estaba corrido a la izquierda
 *      dentro de la contraforma. Acá es simétrico respecto al eje.
 *   4. Bordes dentados y motas de color sueltas.
 */

/**
 * Todo el dibujo sale de estos números. El alto es 348 y el resto está
 * en la misma unidad, así que "60" es el ancho del asta de la B medido
 * sobre un alto de 348.
 */
export const GEOMETRIA = {
  /** Alto total del monograma. Todo lo demás está en esta escala. */
  alto: 348,
  /** Ancho del asta vertical de la B. */
  asta: 60,

  // --- Los cinco tramos horizontales de la B, de arriba hacia abajo:
  //     barra, contraforma, barra, contraforma, barra.
  //     56 + 83 + 57 + 95 + 57 = 348
  /** Abajo de la barra superior. */
  yBarraSup: 56,
  /** Abajo de la contraforma superior. */
  yContraSup: 139,
  /** Abajo de la barra del medio (la cintura). */
  yCintura: 196,
  /** Arriba de la barra inferior. */
  yBarraInf: 291,

  /** Borde derecho de la panza superior. */
  xPanzaSup: 246,
  /** Borde derecho de la contraforma superior. Da pared de 56, igual que las barras. */
  xContraSup: 190,
  /** Radio del arco de la panza superior (la mitad de 196). */
  rPanzaSup: 98,
  /** Radio del arco de la contraforma superior (la mitad de 83). */
  rContraSup: 41.5,

  /** Borde derecho del arco inferior, que es tangente a la línea de base. */
  xPanzaInf: 245,
  /** Radio del arco inferior. Medido sobre el original por mínimos cuadrados. */
  rPanzaInf: 95,

  /** Eje del ápice de la A. */
  Ax: 340,
  /** Pendiente de las patas, dx/dy. IGUAL en las dos: eso corrige el defecto 2. */
  m: 0.56,
  /** Ancho horizontal de cada pata de la A. */
  w: 66,

  /**
   * Canal entre la B y la A, medido perpendicular. Constante.
   * En el original variaba de 70 a 295 unidades y en su punto más
   * apretado se cerraba a 0,89px con el logo a 22px.
   */
  canal: 18,

  /**
   * Pared de la panza inferior de la B, perpendicular. Es lo que hace
   * que la marca lea "BA" y no "PA": sin esta pared la B se queda con
   * una sola panza y es una P. Fina a propósito — así queda el
   * entrelazado — pero nunca cero, que era el defecto del calco.
   * A 26px son 1,49px; a 200px son 11,5px.
   */
  pared: 20,

  // --- Trapecio: el travesaño de la A.
  //     NO es decorativo: sin él la A lee como una Λ. Está medido.
  /** Arriba del trapecio. */
  trapArriba: 236,
  /** Abajo del trapecio. */
  trapAbajo: 288,
  /** Aire horizontal entre el trapecio y el borde interno de cada pata. */
  trapAire: 14,
} as const;

/** Redondea a 2 decimales para que el `d` no lleve basura de coma flotante. */
const r2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Un "estadio": lado izquierdo recto en xIzq y extremo derecho
 * completamente redondo terminando en xDer.
 *
 * `horario` controla el sentido de giro, y el sentido decide si la forma
 * pinta o si agujerea. El camino completo se pinta con la regla nonzero:
 * las formas en sentido horario suman y las antihorarias restan. Por eso
 * las contraformas se dibujan al revés — así quedan como huecos sin
 * necesidad de fill-rule ni de máscaras.
 */
function estadio(
  xIzq: number,
  yArriba: number,
  xDer: number,
  yAbajo: number,
  horario = true,
): string {
  const r = (yAbajo - yArriba) / 2;
  const xa = xDer - r;
  return horario
    ? `M${r2(xIzq)} ${r2(yArriba)}H${r2(xa)}A${r2(r)} ${r2(r)} 0 0 1 ${r2(xa)} ${r2(yAbajo)}H${r2(xIzq)}Z`
    : `M${r2(xIzq)} ${r2(yAbajo)}H${r2(xa)}A${r2(r)} ${r2(r)} 0 0 0 ${r2(xa)} ${r2(yArriba)}H${r2(xIzq)}Z`;
}

type Marca = {
  /** Ancho del viewBox. */
  ancho: number;
  /** Alto del viewBox. */
  alto: number;
  /** `d` del monograma: la B y la A. Va con el color del texto. */
  monograma: string;
  /** `d` del trapecio de la A. Va con el color de acento. */
  trapecio: string;
};

/** Construye los dos caminos a partir de GEOMETRIA. */
function construir(g = GEOMETRIA): Marca {
  const {
    alto, asta, yBarraSup, yContraSup, yCintura, yBarraInf,
    xPanzaSup, xContraSup, rPanzaSup, rContraSup,
    xPanzaInf, rPanzaInf, Ax, m, w, canal, pared,
    trapArriba, trapAbajo, trapAire,
  } = g;

  // La diagonal que limita la B por la derecha: la pata de la A
  // corrida hacia la izquierda el ancho del canal. `norm` pasa de
  // medida perpendicular a medida horizontal.
  const norm = Math.hypot(1, m);
  const K = Ax - canal * norm;
  const limite = (y: number): number => K - m * y;

  const cxSup = xPanzaSup - rPanzaSup;              // centro del arco superior
  const cxInf = xPanzaInf - rPanzaInf;              // centro del arco inferior
  const cyInf = alto - rPanzaInf;                   // tangente a la base
  const arcoInf = (y: number): number =>
    cxInf + Math.sqrt(rPanzaInf ** 2 - (y - cyInf) ** 2);

  // La pieza de cintura arranca donde la diagonal pasa MÁS CERCA del
  // arco superior. Arrancarla ahí deja un escalón de 4 unidades en vez
  // de una espiga: si arranca más arriba, la esquina sobresale del arco.
  const dSup = (K - cxSup - m * 98) / norm;
  const yCinturaIni = 98 + dSup * (m / norm);

  // La contraforma inferior es el estadio MÁS GRANDE cuyo borde quede a
  // `pared` de la diagonal. Se resuelve en vez de fijarse a mano para
  // que siga el ancho de la pared si se cambia.
  const rInf = (yBarraInf - yCintura) / 2;
  const ycInf = (yCintura + yBarraInf) / 2;
  const xContraInf = K + rInf - m * ycInf - (rInf + pared) * norm;

  const d = [
    // Asta de la B.
    `M0 0H${r2(asta)}V${r2(alto)}H0Z`,
    // Panza superior. Va completa: la diagonal no la alcanza.
    `M0 0H${r2(cxSup)}A${r2(rPanzaSup)} ${r2(rPanzaSup)} 0 0 1 ${r2(cxSup)} ${r2(yCintura)}H0Z`,
    // Contraforma superior (hueco).
    estadio(asta, yBarraSup, xContraSup, yContraSup, false),
    // Panza inferior, rebanada por la diagonal. Es recta, sin arco, para
    // que no aparezca una esquina donde el arco se cruza con el tajo.
    `M0 ${r2(yCinturaIni)}H${r2(limite(yCinturaIni))}L${r2(limite(yBarraInf))} ${r2(yBarraInf)}H0Z`,
    // Barra inferior. NO se rebana: es el piso donde muere la pata
    // izquierda de la A. Sin esto la pata queda colgando en el aire.
    `M0 ${r2(yBarraInf)}H${r2(arcoInf(yBarraInf))}A${r2(rPanzaInf)} ${r2(rPanzaInf)} 0 0 1 ${r2(cxInf)} ${r2(alto)}H0Z`,
    // Contraforma inferior (hueco).
    estadio(asta, yCintura, xContraInf, yBarraInf, false),
    // La A. La pata derecha llega a la base; la izquierda muere contra
    // la barra inferior de la B, que es el entrelazado de la ligadura.
    // Sale como un polígono simple porque la contraforma queda abierta
    // por abajo y no hace falta un hueco aparte.
    `M${r2(Ax)} 0L${r2(Ax + m * alto)} ${r2(alto)}L${r2(Ax + m * alto - w)} ${r2(alto)}` +
      `L${r2(Ax)} ${r2(w / m)}L${r2(Ax - m * yBarraInf + w)} ${r2(yBarraInf)}` +
      `L${r2(Ax - m * yBarraInf)} ${r2(yBarraInf)}Z`,
  ].join('');

  // Trapecio: los lados van paralelos a las patas y el ancho se mide
  // desde el eje de la A, así que queda simétrico por construcción.
  const borde = (y: number): number => Ax + m * y - w - trapAire;
  const trapecio =
    `M${r2(2 * Ax - borde(trapArriba))} ${r2(trapArriba)}L${r2(borde(trapArriba))} ${r2(trapArriba)}` +
    `L${r2(borde(trapAbajo))} ${r2(trapAbajo)}L${r2(2 * Ax - borde(trapAbajo))} ${r2(trapAbajo)}Z`;

  return { ancho: r2(Ax + m * alto), alto, monograma: d, trapecio };
}

/** La marca plana, sin envase. Es la que usa el header. */
export const MARCA: Marca = construir();

/**
 * Coloca el monograma centrado dentro de un envase cuadrado.
 *
 * @param lado    Lado del cuadrado del viewBox.
 * @param fraccion Alto del monograma como fracción del lado.
 * @returns El atributo `transform` del grupo, y las medidas resultantes.
 */
export function centrarEnCuadrado(
  lado: number,
  fraccion: number,
): { transform: string; ancho: number; alto: number } {
  const alto = lado * fraccion;
  const escala = alto / MARCA.alto;
  const ancho = MARCA.ancho * escala;
  const tx = (lado - ancho) / 2;
  const ty = (lado - alto) / 2;
  return {
    transform: `translate(${r2(tx)} ${r2(ty)}) scale(${escala.toFixed(5)})`,
    ancho,
    alto,
  };
}

/**
 * Colores de las versiones con envase.
 *
 * Son FIJOS a propósito, y no es un olvido. Un favicon lo dibuja el
 * navegador y un avatar lo dibuja otro sitio: nuestro CSS no llega a
 * ninguno de los dos, así que `currentColor` no tiene contra qué
 * resolverse. Por eso el envase trae su propio fondo — con eso funciona
 * sobre cualquier superficie, clara u oscura, que es justamente para lo
 * que existe. La que se adapta al tema es la marca plana del header.
 *
 * Salen de la paleta del modo oscuro de global.css. Contrastes medidos
 * contra el fondo: letras 14,48:1 y acento 12,07:1.
 */
export const COLORES_ENVASE = {
  fondo: '#0f172a', // --fondo (oscuro)
  letra: '#e2e8f0', // --texto (oscuro)
  acento: '#5eead4', // --acento (oscuro)
} as const;

/**
 * Los dos envases, y por qué son dos.
 *
 * - `cuadrado`: para el favicon. Un cuadrado redondeado deja 34% más de
 *   alto de letra que un círculo (9,0px contra 7,4px a 16px), y a 16px
 *   eso es la diferencia entre leerse y no leerse. El techo geométrico
 *   del círculo para esta relación de aspecto es 54,5% del diámetro, y
 *   el 56% del cuadrado ya deja 36 unidades de aire a cada lado: más
 *   grande y el monograma toca el borde redondeado.
 * - `circulo`: para avatares y para la tarjeta social. Las plataformas
 *   recortan los avatares a círculo, así que el círculo es obligado ahí:
 *   un cuadrado se vería con las esquinas cortadas.
 */
export const ENVASES = {
  cuadrado: { lado: 512, fraccion: 0.56, radio: 113 },
  circulo: { lado: 512, fraccion: 0.46, radio: null },
} as const;

/** Arma el SVG completo de una versión con envase. */
export function svgConEnvase(cual: keyof typeof ENVASES): string {
  const { lado, fraccion, radio } = ENVASES[cual];
  const { transform } = centrarEnCuadrado(lado, fraccion);
  const c = COLORES_ENVASE;
  const fondo =
    radio === null
      ? `<circle cx="${lado / 2}" cy="${lado / 2}" r="${lado / 2}" fill="${c.fondo}"/>`
      : `<rect width="${lado}" height="${lado}" rx="${radio}" fill="${c.fondo}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lado} ${lado}" role="img" aria-label="BA">
  ${fondo}
  <g transform="${transform}">
    <path d="${MARCA.monograma}" fill="${c.letra}"/>
    <path d="${MARCA.trapecio}" fill="${c.acento}"/>
  </g>
</svg>
`;
}

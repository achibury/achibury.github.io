/**
 * Vocabulario controlado del portafolio.
 *
 * Por que existe: sin una lista cerrada, la misma herramienta termina
 * escrita de varias formas ("Volatility", "Volatility3", "volatility 3")
 * y cada variante cuenta como una etiqueta distinta. El schema Zod valida
 * contra estas listas, asi que una herramienta mal escrita rompe el build
 * en vez de ensuciar el sitio en silencio.
 *
 * Para agregar una herramienta nueva: sumala aca, respetando como se
 * escribe oficialmente (mayusculas incluidas). Es el unico lugar.
 *
 * ORDEN ALFABETICO, ignorando mayusculas y minusculas. No es estetica:
 * con la lista ordenada, al ir a agregar algo ves de inmediato si ya
 * estaba. Sin orden se cuelan duplicados (paso con 'Wireshark', que
 * llego a estar dos veces).
 */

export const HERRAMIENTAS = [
  'Atomic Red Team',
  'Autopsy',
  'Elastic',
  'FTK Imager',
  'KAPE',
  'MISP',
  'PNETLab',
  'PowerShell',
  'rsyslog',
  'Sigma',
  'Splunk',
  'Suricata',
  'Sysmon',
  'TheHive',
  'Velociraptor',
  'Volatility 3',
  'Wazuh',
  'WinPmem',
  'Wireshark',
  'YARA',
  'Zeek',
] as const;

export type Herramienta = (typeof HERRAMIENTAS)[number];

/**
 * Funciones del NIST Cybersecurity Framework 2.0.
 *
 * Son seis en el marco original; aca van las cinco operativas. Se omite
 * "gobernar" (GOVERN) a proposito: es una funcion de gobernanza
 * organizacional, no algo que se demuestre en un laboratorio tecnico.
 */
export const FUNCIONES = [
  'identificar',
  'proteger',
  'detectar',
  'responder',
  'recuperar',
] as const;

export type Funcion = (typeof FUNCIONES)[number];

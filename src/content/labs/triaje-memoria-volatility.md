---
titulo: Triaje de memoria en una estación de trabajo comprometida
resumen: Recorrido completo de adquisición y análisis de memoria RAM con Volatility 3, desde la captura hasta la línea de tiempo de lo que pasó.
fecha: 2026-08-09
categoria: analisis
herramientas:
  - Volatility 3
  - WinPmem
  - FTK Imager
mitre_attack:
  - T1055
  - T1547.001
funcion:
  - responder
borrador: true
---

> **Contenido de ejemplo.** Todo lo que sigue es ficticio y está acá para
> mostrar cómo se ve un lab terminado. Reemplaza el texto por el tuyo.

## Escenario

Simulé el caso más común de mesa de ayuda: un usuario reporta que su equipo
"anda lento" y que el antivirus mostró una alerta que desapareció sola.
La máquina sigue encendida.

Esa última parte es la que manda. **Con el equipo encendido, la memoria es la
evidencia más valiosa y la más frágil**: si alguien lo apaga, se pierde entera.

## Adquisición

Primero la memoria, después el disco. El orden importa: cada minuto que pasa,
la RAM cambia.

```bash
# Captura de memoria a un disco externo, nunca al disco de la máquina
winpmem_mini_x64.exe \\.\E:\caso-2026-042\memoria.raw

# Hash inmediato, antes de tocar nada más
certutil -hashfile E:\caso-2026-042\memoria.raw SHA256
```

El hash se calcula **en el momento de la captura**, no después. Es lo que
permite demostrar más adelante que el archivo analizado es el mismo que se
adquirió.

| Dato | Valor |
| --- | --- |
| Tamaño | 16 GB |
| SHA-256 | `a3f5...9c21` (truncado) |
| Herramienta | WinPmem 4.0 |
| Duración | 6 minutos |

## Análisis con Volatility 3

### Procesos en ejecución

```bash
python3 vol.py -f memoria.raw windows.pslist.PsList
```

Entre procesos normales apareció uno raro:

```text
PID    PPID   ImageFileName    Offset(V)          Threads
----   ----   --------------   ----------------   -------
4      0      System           0x8e0a1b2c3000     142
508    4      smss.exe         0x8e0a1c4d5000     3
1284   508    svch0st.exe      0x8e0a2f6e7000     8
2156   1284   cmd.exe          0x8e0a3a8f9000     1
```

`svch0st.exe` — con un **cero en lugar de la "o"**. El proceso legítimo se
llama `svchost.exe`. Además, el padre estaba mal: `svchost.exe` real cuelga
de `services.exe`, no de `smss.exe`.

### Conexiones de red

```bash
python3 vol.py -f memoria.raw windows.netscan.NetScan
```

El PID 1284 tenía una conexión establecida hacia una IP externa por el puerto
443. Puerto normal, destino que no correspondía a ningún servicio conocido de
la organización.

### Inyección de código

```bash
python3 vol.py -f memoria.raw windows.malfind.Malfind --pid 1284
```

Regiones de memoria con permisos de **lectura, escritura y ejecución a la vez**
(`PAGE_EXECUTE_READWRITE`) y una cabecera `MZ` adentro. Esa combinación es la
firma clásica de un ejecutable escrito directamente en memoria: el código nunca
tocó el disco.

### Persistencia

```bash
python3 vol.py -f memoria.raw windows.registry.printkey.PrintKey \
  --key "Software\Microsoft\Windows\CurrentVersion\Run"
```

Una entrada llamada `WindowsUpdateHelper` apuntando a un ejecutable en
`%APPDATA%`. Nombre creíble, ubicación que Windows Update jamás usaría.

## Línea de tiempo

1. **09:14** — El usuario abre un adjunto de correo.
2. **09:14** — Se crea `svch0st.exe` en `%APPDATA%`.
3. **09:15** — Se escribe la clave de persistencia en `Run`.
4. **09:16** — Primera conexión saliente al servidor externo.
5. **09:42** — El antivirus alerta y bloquea un archivo secundario.
6. **10:05** — El usuario reporta la lentitud.

Casi **una hora** entre la ejecución inicial y el reporte. El malware tuvo ese
tiempo para establecerse y comunicarse.

## Conclusiones

1. **La memoria mostró lo que el disco no tenía.** El código inyectado nunca
   se escribió en disco: un análisis solo de disco habría encontrado la
   persistencia, pero no el payload.
2. **La relación padre-hijo es un indicador de primera línea.** Antes de mirar
   nada sofisticado, revisar qué proceso lanzó a cuál descarta o confirma
   rapidísimo.
3. **El typosquatting de nombres de procesos sigue funcionando.** `svch0st.exe`
   pasa desapercibido en una lista larga leída con apuro.

## Errores que cometí

- Corrí `pslist` antes de anotar el hash de la captura. Lo corregí, pero en un
  caso real ese descuido compromete la cadena de custodia.
- Perdí tiempo buscando el ejecutable en disco antes de asumir que podía ser
  solo-memoria. Con `malfind` primero habría llegado antes.

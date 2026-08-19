---
titulo: Detección de PowerShell ofuscado con Sysmon y Sigma
resumen: Monté un laboratorio para generar comandos de PowerShell ofuscados y escribí una regla Sigma que los detecta sin ahogarse en falsos positivos.
fecha: 2026-07-22
categoria: deteccion
herramientas:
  - Sysmon
  - Sigma
  - Elastic
  - PowerShell
mitre_attack:
  - T1059.001
  - T1027
funcion:
  - detectar
borrador: true
---

> **Contenido de ejemplo.** Todo lo que sigue es ficticio y está acá para
> mostrar cómo se ve un lab terminado. Reemplaza el texto por el tuyo.

## Contexto

Los atacantes rara vez escriben PowerShell en limpio: lo codifican en Base64,
lo parten en concatenaciones o lo esconden detrás de alias. Quería entender
qué queda visible en los logs cuando eso pasa, y hasta dónde se puede detectar
sin llenar la consola de ruido.

El objetivo del lab fue concreto: **una regla que detecte ofuscación real y
que no se dispare con la actividad legítima de administración.**

## Montaje del laboratorio

Una máquina virtual Windows 11 con Sysmon, mandando eventos a un Elastic
Stack en un contenedor aparte.

| Componente | Rol |
| --- | --- |
| VM Windows 11 | Objetivo, genera los eventos |
| Sysmon 15 | Registra creación de procesos (Event ID 1) |
| Winlogbeat | Envía los eventos a Elastic |
| Elastic + Kibana | Almacenamiento y búsqueda |

La configuración de Sysmon partió de la base de SwiftOnSecurity, recortada
para quedarme solo con lo que necesitaba:

```xml
<Sysmon schemaversion="4.90">
  <EventFiltering>
    <RuleGroup name="Creación de procesos" groupRelation="or">
      <ProcessCreate onmatch="include">
        <Image condition="end with">powershell.exe</Image>
        <Image condition="end with">pwsh.exe</Image>
      </ProcessCreate>
    </RuleGroup>
  </EventFiltering>
</Sysmon>
```

## Generación de la actividad

Ejecuté tres variantes del mismo comando inofensivo, cada una con un método
de ofuscación distinto:

```powershell
# 1. Base64 — el clásico
$cmd = "Get-Process | Select-Object -First 5"
$b64 = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($cmd))
powershell.exe -EncodedCommand $b64

# 2. Concatenación de cadenas
powershell.exe -Command "&('Get-Pro'+'cess')"

# 3. Banderas abreviadas y ventana oculta
powershell.exe -w hidden -nop -ep bypass -c "Get-Process"
```

![Vista de los eventos de creación de proceso en Kibana](/img/captura-ejemplo.svg)

*Los tres comandos aparecen en el índice, con la línea de comandos completa.*

## Lo que se vio en los logs

El hallazgo importante: **`-EncodedCommand` no oculta nada frente a Sysmon.**
La línea de comandos queda registrada entera, Base64 incluido, y se puede
decodificar después. La ofuscación esconde el comando de una persona que
mira por encima, no del registro de eventos.

Las tres variantes dejaron señales distintas:

- **Base64**: cadena larga sin espacios, con la proporción de mayúsculas y
  dígitos típica de una codificación.
- **Concatenación**: comillas y signos `+` dentro del argumento de `-Command`.
- **Banderas abreviadas**: `-w hidden` y `-ep bypass` juntas, combinación que
  casi no aparece en administración normal.

## La regla Sigma

Apunté a las banderas, no al contenido codificado. Razón: el Base64 legítimo
existe (varias herramientas de despliegue lo usan), pero **ocultar la ventana
y saltarse la política de ejecución al mismo tiempo casi nunca es legítimo.**

```yaml
title: PowerShell con ventana oculta y política de ejecución omitida
id: 8f2c1d40-3b7a-4e91-a5c2-7d9e0f1a2b3c
status: experimental
description: Detecta PowerShell lanzado ocultando la ventana y saltándose la política de ejecución.
logsource:
  category: process_creation
  product: windows
detection:
  seleccion_imagen:
    Image|endswith:
      - '\powershell.exe'
      - '\pwsh.exe'
  seleccion_banderas:
    CommandLine|contains|all:
      - ' -w'
      - ' hidden'
  seleccion_politica:
    CommandLine|contains:
      - ' -ep bypass'
      - ' -ExecutionPolicy Bypass'
  condition: seleccion_imagen and seleccion_banderas and seleccion_politica
falsepositives:
  - Scripts de despliegue internos que ocultan la ventana a propósito
level: medium
```

## Falsos positivos

Dejé la regla corriendo cuatro días sobre la actividad normal de la VM.
Resultado: **dos alertas, ambas del mismo script de inventario** que un
administrador había dejado programado. Ninguna otra.

Eso confirmó la hipótesis de partida: exigir las dos condiciones juntas
—ventana oculta *y* política omitida— es lo que mantiene el ruido abajo.
Con cualquiera de las dos por separado, las alertas se multiplicaban.

## Conclusiones

1. La ofuscación de PowerShell **no evade el registro de eventos**, solo la
   lectura rápida de un analista.
2. Detectar *combinaciones* de banderas funciona mejor que buscar el
   contenido del comando: hay muchas formas de escribir el mismo payload,
   pero pocas de invocarlo sigilosamente.
3. Toda regla necesita su período de observación antes de pasar a producción.
   Sin esos cuatro días no habría encontrado el script de inventario.

## Próximos pasos

- Sumar el Event ID 4104 (bloques de script de PowerShell), que registra el
  código ya decodificado.
- Medir cuánto sube el volumen de logs con ese registro activado.

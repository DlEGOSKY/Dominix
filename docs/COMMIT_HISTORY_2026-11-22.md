# Organización de la candidata 0.2.0 en commits

22 de noviembre de 2026. El trabajo acumulado desde `f2a8677` se organiza por responsabilidades y dependencias. Las fechas de commit son las reales de esta organización; los informes anteriores conservan las fechas de sus revisiones. No se inventa una cronología de desarrollo ni se reescribe la historia ya publicada.

| Paso | Ámbito | Propósito |
|---|---|---|
| 1 | Plataforma y offline | Caché por build, fuentes e iconos locales, herramientas de comprobación |
| 2 | Motor | Inventario persistente, rondas, efectos, patrones, score y RNG |
| 3 | Arte | Materiales, colecciones, caras contables e iconos |
| 4 | Colección | Armario, probador, filtros y favoritos |
| 5 | Menú | Jerarquía, navegación agrupada y acceso a Apariencia |
| 6 | Mesa | Lectura táctica, extremos, fichas, controles y recursos accesibles |
| 7 | Movimiento y encuentros | Efectos breves, contactos, jefes y fondos |
| 8 | Portapapeles | Confirmación real, fallos y copia manual del historial |
| 9 | Aprendizaje | Práctica guiada y ejemplos con reglas reales |
| 10 | Integración de run | Continuar, guardar, exportar/importar, recompensas y cierre |
| 11 | Liquidación | Recuperación ante cierre durante XP/historial/maestría |
| 12 | QA | Recorridos de navegador, estados preparados y herramientas de recursos |
| 13 | Documentación | Auditorías, dirección artística, procedencia y límites |
| 14 | Entrega | Versión 0.2.0, notas y puertas de CI/despliegue |

Algunas bases se introducen antes de su integración visible. Los cambios que comparten tipos o contratos se mantienen juntos; no se separan artificialmente en un commit por archivo. Las etapas intermedias deben pasar TypeScript, sus pruebas disponibles y compilación antes de quedar incorporadas a la rama.

La organización usa árboles de Git y copias temporales para comprobar cada etapa sin reemplazar el trabajo del usuario en su directorio. El árbol final debe coincidir con la candidata completa. Capturas, perfiles de navegador, logs y ZIP de revisión permanecen fuera del repositorio; se excluyen dependencias instaladas y cachés.

Los SHA, número real de pruebas y resultados por etapa se registran en `outputs/dominix-review/commit-history-2026-11-22/`, relativo al espacio de trabajo. Tener commits locales no significa haber desplegado la web: la subida de rama, CI y publicación siguen siendo pasos diferenciados. [Evaluación de salida](RELEASE_READINESS_2026-11-22.md).

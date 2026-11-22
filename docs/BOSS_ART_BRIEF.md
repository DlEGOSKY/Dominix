# Fondo de presentación de jefe: generado e integrado

## Estado real

El 8 de noviembre de 2026 se verificó la conexión efectiva a Higgsfield. El saldo consultado era 10 créditos, plan free. La estimación de una imagen `gpt_image_2_6`, 16:9 y cantidad 1 devolvió 0,25 créditos. El usuario autorizó ese importe en el chat.

La solicitud fue rechazada con `Requires basic plan or higher.` y `INVALID_ARGUMENT`, sin ID de trabajo ni archivo. La consulta posterior mantuvo el saldo en 10 créditos. No se activó una prueba, no se contrató un plan y no se consumieron créditos. La mera estimación no acreditaba que el plan pudiera ejecutar el modelo.

Posteriormente la cuenta respondió con capacidad habilitada para el modelo. Se volvió a cotizar exactamente la misma imagen en 0,25 créditos y se utilizó la autorización existente, sin contratar ni activar servicios desde el agente. Esta vez se completó una única generación, trabajo `3f9e60fa-75c9-47ee-96e1-4eafce14cf30`, modelo `gpt_image_2_6`. El consumo de 0,25 créditos se verificó consultando el saldo antes y después. No se generaron variantes adicionales.

## Integración realizada

Un fondo ambiental discreto solo en BossIntro, con degradado oscuro por delante, conservando el icono, títulos, tipografía, controles, colores y disposición. Imagen estática sin texto, animación ni vídeo. Se refuerza ligeramente el contraste de la descripción y el contador de fases. La portada se conserva.

La salida real fue PNG RGB, 1344 × 752 y 1075398 bytes, archivada fuera del repositorio en `outputs/dominix-review/boss-threshold-higgsfield-original.png`. Se redimensionó y comprimió mecánicamente con Pillow a WebP calidad 80, método 6:

| Archivo | Dimensiones | Bytes |
| --- | --- | ---: |
| `src/assets/boss-threshold-v1.webp` | 1280 × 716 | 19214 |
| `src/assets/boss-threshold-mobile-v1.webp` | 640 × 358 | 6226 |

`BossIntro.tsx` usa `<picture>` con umbral móvil de 640px. Los archivos se solicitan al montar la presentación, no mediante una imagen en portada. El fondo es decorativo, con alt vacío y sin controles interceptados. Se comprobó `currentSrc`, carga completa y dimensiones reales en navegador: recurso 1280 en escritorio y 640 en móvil. A 390 × 844 no hay desbordamiento horizontal. Se revisaron contraste, recorte y continuidad al pulsar el botón de entrar al combate, con movimiento reducido activo.

Capturas en `outputs/dominix-review`: `higgsfield-jefe-escritorio.jpg` y `higgsfield-jefe-movil.jpg`. Son vistas del componente real dentro del escenario QA identificado, no una partida natural en ronda 65. La textura de la mesa sigue procediendo de ImageGen, documentada por separado.

No se aportaron imágenes de terceros como referencia. Este registro acredita la procedencia y la optimización, sin afirmar exclusividad ni garantías de propiedad intelectual. Se aplican las condiciones del servicio de Higgsfield; no se adquirió una licencia externa adicional.

## Prompt exacto enviado

```text
Production background asset for the existing Dominix tactical domino roguelike, not a UI mockup. A restrained ritual threshold inside an ancient chamber built of immense dark obsidian domino-shaped monoliths, abstract and architectural, no characters. Wide cinematic 16:9 composition. The darkest and quietest area is the central 50 percent, reserved as negative space behind a boss title and readable game controls. Sparse physical details on the far left and right: worn black stone, faint carved circular pip recesses, a little dust caught in narrow violet rim light. Restrained premium game concept art, painterly material realism, strong silhouette design, deliberate asymmetry and convincing scale. Palette follows the existing game's ink navy #0a0a0f, #12121a, muted blue-violet #1a1a26, with extremely restrained wine-red glints at the outer edges. Soft atmospheric depth, very low luminance overall, no bright central light and no prominent focal object in the middle. It should suggest a formidable guardian waiting beyond the domino table without depicting a literal humanoid boss. Preserve the original game's dark blue-violet identity. Absolutely no words, letters, numbers, logos, interface, buttons, cards, casino imagery, neon cyberpunk, green, beige, gold filigree, magical geometric diagrams, excessive decoration, skull icons or border. A single continuous wide environmental illustration, safe to crop at mobile portrait, not a redesign of the game.
```

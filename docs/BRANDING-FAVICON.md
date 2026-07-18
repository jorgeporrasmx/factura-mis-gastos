# Favicon y assets de marca — notas de mantenimiento

## Dónde viven los assets

El logotipo de Factura Mis Gastos (círculo azul con F + palomita) se sirve
mediante rutas estáticas con la imagen embebida en base64:

- `src/app/favicon.ico/route.ts` → `/favicon.ico`
- `src/app/og-image.png/route.ts` → `/og-image.png` (vista previa al compartir)
- `src/app/logo.png/route.ts` → `/logo.png` (Schema.org / Google)
- `src/app/apple-touch-icon.png/route.ts` → `/apple-touch-icon.png`
- `src/app/icon-192.png/route.ts` y `src/app/icon-512.png/route.ts` → iconos PWA
- `public/favicon.svg` → favicon SVG
- `src/app/layout.tsx` → referencias con cache-buster `?v=2`

`public/googleff7cf3aaa011cbff.html` es la verificación de propiedad de
Google Search Console. **No eliminar nunca**: si desaparece del sitio, se
pierde el acceso a Search Console.

## Historial del incidente (julio 2026)

- El sitio sirvió durante meses el `favicon.ico` por defecto de Next.js
  (el triángulo de Vercel), que Google indexó como icono del sitio.
- 10-jul-2026: fix aplicado en `main` (PR #76) y desplegado a producción.
- 13-jul-2026: deploys a producción desde `fmg-ai-accountant-mvp` (rama sin
  el fix) revirtieron el favicon al triángulo de Vercel sin que nadie lo
  notara. Google re-rastreó y siguió viendo el icono viejo.
- 18-jul-2026: fix replicado también en `fmg-ai-accountant-mvp`.

## Reglas para no repetirlo

1. **No desplegar a producción desde ramas que no incluyan estos archivos.**
   Antes de promover una rama, verificar que exista
   `src/app/favicon.ico/route.ts` y NO exista el binario `src/app/favicon.ico`.
2. **No re-publicar ("Redeploy"/"Promote") deployments de Vercel anteriores
   al 10-jul-2026** — sirven el favicon de Vercel y borran la verificación
   de Search Console.
3. Al hacer merge de ramas viejas, conservar los archivos listados arriba.
4. Los archivos reales en `public/` (PNG/ICO binarios) pueden reemplazar a
   las rutas cuando se suban por git normal; en ese caso eliminar las
   carpetas `src/app/*.png/` y `src/app/favicon.ico/` en el mismo commit.

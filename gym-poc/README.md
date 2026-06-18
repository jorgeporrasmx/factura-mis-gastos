# 🏋️ Gym Form Coach — Prototipo

Prototipo **autocontenido** de evaluación de ejercicios con la cámara del celular.
Detecta la pose del cuerpo, cuenta repeticiones y da feedback de técnica **en tiempo
real**. Empieza con **sentadilla**; está diseñado para añadir más ejercicios sin
reescribir el motor.

> ⚠️ Es un producto experimental separado de `factura-mis-gastos`. No comparte
> dependencias ni build con la app de facturación. No es consejo médico.

## Por qué este enfoque

- **Pose on-device con MediaPipe / BlazePose** (33 puntos, 3D), licencia Apache 2.0
  (uso comercial libre). El video **nunca sale del dispositivo** → privado, gratis,
  sin latencia de red y sin costo por usuario.
- **Sin paso de build**: HTML + JS módulos + CDN. Se sirve como estático.

## Cómo ejecutarlo

La cámara requiere un contexto seguro: **`localhost` o HTTPS**.

```bash
cd gym-poc
python3 -m http.server 8000
# abre http://localhost:8000
```

Para probar en el **celular**, sírvelo por HTTPS (p. ej. `npx serve` + un túnel
como `ngrok`/`cloudflared`, o despliega la carpeta en cualquier hosting estático)
y abre la URL en el teléfono.

## Cómo usarlo

1. Elige el ejercicio.
2. Coloca el celular según la guía en pantalla (sentadilla: vista lateral/45°,
   cuerpo completo visible).
3. "Iniciar cámara" → realiza las repeticiones. Verás reps, ángulos y avisos.

## Arquitectura

```
src/
  geometry.js          Matemática pura (ángulos, suavizado, landmarks). Sin lógica de ejercicio.
  evaluator.js         Motor GENÉRICO: máquina de estados de reps + ejecuta checks.
  pose.js              Cámara + modelo MediaPipe + dibujo del esqueleto.
  app.js               Orquestación + UI.
  exercises/
    squat.js           Definición DECLARATIVA de la sentadilla (el "modelo" de buena técnica).
    index.js           Registro de ejercicios.
index.html / styles.css
```

El flujo: `pose.js` entrega 33 landmarks por frame → `evaluator.js` aplica la
config del ejercicio → `app.js` pinta el resultado.

## Qué evalúa hoy (sentadilla)

| Aspecto | Cómo |
|---|---|
| **Repeticiones** | Ángulo de rodilla con histéresis (abajo <100°, arriba >160°). |
| **Profundidad / ROM** | Ángulo mínimo de rodilla en el fondo (paralelo ≈ 95°). |
| **Seguridad — espalda** | Inclinación del torso vs vertical (aviso si >55°). |
| **Protección — rodillas** | Valgo (rodillas hacia dentro) por ratio rodilla/tobillo. |
| **Duración / tempo** | Tiempo por rep; avisa si es demasiado rápida (sin control). |
| **Simetría** | Diferencia entre rodilla izquierda y derecha en el fondo. |

Una rep con error grave (p. ej. profundidad insuficiente) **no se cuenta**.

## Añadir un ejercicio nuevo

Crea `src/exercises/<nombre>.js` copiando la estructura de `squat.js`:

- `computeMetrics(landmarks)` → objeto de ángulos/métricas (o `null` si no es evaluable).
- `repTracking` → `{ metric, downBelow, upAbove }` (histéresis del conteo).
- `liveChecks[]` → checks por frame (postura instantánea).
- `repChecks[]` → checks al cerrar cada repetición.

Regístralo en `src/exercises/index.js`. El motor no se toca.

## Limitaciones conocidas (honestas)

- Requiere **un ejercicio a la vez**, cuerpo completo en cuadro y una vista definida.
- Sensible a **ropa holgada/oscura, fondo con poco contraste y oclusión** (mancuernas, máquinas).
- 2D monocular: estima profundidad de forma aproximada; no mide carga ni fatiga.
- Los umbrales son un punto de partida; en producción conviene **calibrarlos por usuario**.

## Próximos pasos sugeridos

1. Calibración inicial (altura/proporciones del usuario) para umbrales personalizados.
2. Feedback por voz (TTS) para no tener que mirar la pantalla.
3. Más ejercicios: flexión, peso muerto, zancada, curl de bíceps.
4. Guardar solo **métricas numéricas** de la sesión (nunca video) si se quiere historial.
5. Validar precisión contra video etiquetado antes de exponerlo a usuarios reales.

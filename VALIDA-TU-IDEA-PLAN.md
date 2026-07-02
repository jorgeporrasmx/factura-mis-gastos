# VALIDA TU IDEA — Plan definitivo y prompt maestro

> Documento de especificación para construir la app. Versión 1.0 — pendiente de tu aprobación antes de iniciar el desarrollo.

---

## 1. Qué es

**valida-tu-idea** es una app web que acompaña a un emprendedor desde una idea difusa hasta un paquete listo para construir su empresa, en 5 etapas guiadas por IA (Claude). La app misma es un MVP: sencilla, efectiva, y probada por completo por ti antes de cobrar por el servicio.

**Usuario objetivo:** emprendedores de habla hispana (México/LatAm), principalmente con ideas basadas en inteligencia artificial.

**Promesa central:** validación honesta y con datos reales — no un generador de humo que le dice a todos que su idea es buena.

---

## 2. Decisiones ya tomadas (confirmadas contigo)

| Decisión | Elección |
|---|---|
| Repositorio | Repo nuevo y único: `valida-tu-idea` (sin relación con factura-mis-gastos) |
| Idioma | 100% español |
| Tono de la IA | Directo y sin rodeos, como inversionista experimentado: cálido pero franco |
| Usuarios | Firebase Auth (Google) + proyectos guardados en Firestore |
| Investigación (Etapa 2) | API de Claude con búsqueda web real y fuentes citadas |
| Entregable final del MVP | Brief completo + "prompt maestro" listo para pegar en Claude Code (la generación real de código queda para v2) |
| Pagos | Fuera del alcance v1 — primero pruebas tú el producto completo |

---

## 3. Las 5 etapas del producto

### Etapa 1 — Entrevista: clarificar la idea

Claude entrevista al emprendedor en un chat conversacional (streaming), una pregunta a la vez, profundizando cuando la respuesta es vaga. **Las preguntas clave, en orden:**

1. **La idea en una frase.** "Cuéntame tu idea como se la contarías a un amigo en el elevador." (elevator pitch)
2. **El problema.** "¿Qué problema concreto resuelve? Describe la última vez que viste a alguien sufrirlo."
3. **El cliente ideal.** "¿A quién le duele más este problema? Ponle nombre: edad, ocupación, contexto."
4. **La alternativa actual.** "¿Cómo resuelve hoy ese problema tu cliente? (aunque sea con Excel, WhatsApp o no haciéndolo)"
5. **El modelo de dinero.** "¿Cómo vas a ganar dinero? ¿Quién paga, cuánto y cada cuándo?"
6. **La diferencia.** "¿Por qué alguien te elegiría a ti y no a lo que ya usa? ¿Qué sabes o tienes tú que otros no?"
7. **La analogía.** "¿A qué empresa conocida se parece tu idea? ('Soy el ___ de ___')"
8. **El porqué ahora.** "¿Qué cambió en el mundo para que esta idea funcione hoy y no hace 5 años?"
9. **El primer paso.** "¿Qué necesitas mínimamente para conseguir tu primer cliente pagando?"

**Salida:** una **Ficha de Idea** estructurada (JSON validado con structured outputs) que el emprendedor revisa y puede editar antes de pasar a la Etapa 2. Campos: pitch, problema, cliente ideal, alternativas, modelo de ingresos, diferenciador, analogía, timing, alcance inicial.

### Etapa 2 — Investigación: ¿ya existe? ¿vale la pena?

Claude investiga con **búsqueda web real** (herramienta `web_search` de la API, con citas):

- Identifica las 3–7 empresas más parecidas (nombre, qué hacen, precio, tracción visible, en qué se diferencian).
- Evalúa tamaño de mercado aproximado y señales de demanda.
- Emite un **veredicto concreto tipo semáforo**:
  - 🟢 **Verde** — hay mercado y espacio para diferenciarse; continúa.
  - 🟡 **Amarillo** — la idea necesita un giro (pivote sugerido explícito); continúa con ajustes.
  - 🔴 **Rojo** — mercado saturado o problema inexistente; se explica por qué con datos y fuentes.
- Todo con **fuentes citadas y enlaces** — la credibilidad de este paso es el corazón del producto.

El emprendedor decide con un botón si avanza (puede avanzar incluso en rojo, pero queda registrado el veredicto).

### Etapa 3 — Abogado del diablo

Solo si pasó la Etapa 2. Claude cambia de rol: ahora **trata de convencer al emprendedor de que NO lo haga**.

- Presenta las 5 razones más probables de fracaso, específicas a SU idea (no genéricas), apoyadas en lo que encontró la investigación.
- Detona una conversación: el emprendedor responde a cada objeción, Claude contra-argumenta con franqueza (tono de inversionista directo, no cruel).
- Al final Claude resume: "Estas objeciones las respondiste bien; estas siguen abiertas."
- **Botón de decisión explícito:** "Decido continuar" / "Lo dejo aquí". La decisión es del emprendedor, informada.

### Etapa 4 — Definición del MVP

Claude genera la definición completa del mínimo producto viable, y **cada bloque es editable** por el emprendedor:

- Cliente ideal afinado (perfil + dolor principal)
- Propuesta de valor en una frase
- Las 3 funciones mínimas del producto (y qué queda explícitamente fuera)
- Precio inicial y modelo de cobro
- Cómo conseguir los primeros 5 clientes
- Métrica de éxito de los primeros 30 días
- Riesgos aceptados (heredados de la Etapa 3)

### Etapa 5 — Paquete comercializable

Con el MVP aprobado, Claude genera el paquete completo:

1. **Landing page** — copy completo optimizado: titular, subtítulo, dolores, beneficios, oferta, llamado a la acción, FAQ.
2. **Paquetes a la medida** — 2–3 niveles de precio con justificación.
3. **Estrategia de marketing** — canales priorizados para ESE cliente ideal, mensajes clave, presupuesto sugerido.
4. **Estrategia de lanzamiento** — plan de 30 días, semana por semana.
5. **Prompt maestro para Claude Code** — un prompt autocontenido que incluye todo lo anterior más especificación técnica sugerida, listo para pegar en Claude Code y que construya el SaaS. *(Este es el puente a la generación real de código en v2.)*

Todo descargable (Markdown) y guardado en el proyecto.

---

## 4. Stack técnico

| Capa | Elección | Por qué |
|---|---|---|
| Framework | **Next.js 16 + React 19 + TypeScript** | Mismo stack que ya dominas en tus otros proyectos |
| UI | Tailwind CSS 4 + shadcn/ui | Rápido, limpio, consistente |
| Auth + datos | **Firebase Auth (Google) + Firestore** | Ya tienes cuenta y experiencia; costo ~$0 en fase de prueba |
| IA | **API de Claude** vía `@anthropic-ai/sdk`, siempre server-side (route handlers) | La API key nunca toca el navegador |
| Deploy | **Vercel** | Ya lo usas; deploy automático desde GitHub |

### Uso de la API de Claude (lo importante)

- **Modelo:** `claude-opus-4-8` para todas las etapas ($5 entrada / $25 salida por millón de tokens). Es el modelo recomendado hoy: la calidad de la entrevista, la investigación y el abogado del diablo ES el producto. Si tras medir los costos reales quieres bajar, `claude-sonnet-5` ($3/$15, con precio introductorio $2/$10 hasta ago-2026) es el siguiente escalón — pero esa decisión la tomas tú con datos.
- **Pensamiento adaptativo:** `thinking: {type: "adaptive"}` — Claude decide cuánto razonar según la dificultad.
- **Streaming** en todas las respuestas de chat para que se sienta vivo.
- **Búsqueda web** (`web_search_20260209`) solo en la Etapa 2, con `max_uses` limitado (control de costo) y citas activadas.
- **Structured outputs** (esquemas Zod) para la Ficha de Idea, el veredicto y los bloques del MVP — nada de parsear texto libre.
- **Prompt caching** en los system prompts largos de cada etapa (reduce ~90% el costo de la parte repetida).
- **Control de gasto:** contador de tokens por proyecto guardado en Firestore; tope configurable por proyecto para que puedas probar sin sustos. Costo estimado por validación completa: en el orden de **$1–3 USD** con Opus 4.8 (lo mediremos con precisión en tus primeras pruebas).

### Modelo de datos (Firestore)

```
users/{uid}
projects/{projectId}
  ├─ ownerUid, nombre, etapaActual (1–5), createdAt
  ├─ fichaIdea { pitch, problema, clienteIdeal, ... }     ← editable
  ├─ investigacion { competidores[], veredicto, fuentes[] }
  ├─ abogadoDelDiablo { objeciones[], resumen, decision }
  ├─ mvp { propuestaValor, funciones[], precio, ... }     ← editable
  ├─ paqueteComercial { landing, paquetes, marketing, lanzamiento, promptMaestro }
  ├─ chats/{etapa} → historial de mensajes por etapa
  └─ usoTokens { entrada, salida, busquedas }
```

### Pantallas

1. **Login** (Google) → 2. **Mis proyectos** (lista + "Nueva idea") → 3. **Wizard de 5 etapas** con barra de progreso, chat con streaming a la izquierda / resultados estructurados editables a la derecha (en móvil, tabs) → 4. Descarga del paquete final.

---

## 5. Plan de construcción (una vez aprobado)

| Fase | Entregable | Puedes probar |
|---|---|---|
| 1 | Repo nuevo + esqueleto Next.js + login Google + lista de proyectos | Entrar y crear un proyecto vacío |
| 2 | Etapa 1 completa: entrevista con streaming + Ficha de Idea editable | Validar la entrevista con una idea real tuya |
| 3 | Etapa 2: investigación con búsqueda web + veredicto semáforo | Ver competidores reales y fuentes |
| 4 | Etapa 3: abogado del diablo + botón de decisión | La conversación difícil |
| 5 | Etapas 4 y 5: MVP editable + paquete comercial + prompt maestro | Flujo completo de punta a punta |
| 6 | Pulido: control de gasto, manejo de errores, deploy en Vercel | Prueba final antes de comercializar |

**Fuera del alcance v1 (deliberadamente):** pagos/Stripe, inglés, generación real de código, colaboración multiusuario, apps móviles.

---

## 6. Prompt maestro (para iniciar el desarrollo)

> Este es el prompt que me das (o que guardas para cualquier sesión futura de Claude Code) para construir la app exactamente como quedó definida:

```
Construye la app web "valida-tu-idea" siguiendo el documento VALIDA-TU-IDEA-PLAN.md.

Contexto: app en español (México/LatAm) que valida ideas de negocio en 5 etapas:
(1) entrevista guiada con las 9 preguntas clave → Ficha de Idea editable,
(2) investigación de competidores con búsqueda web real y veredicto semáforo con fuentes,
(3) abogado del diablo con tono directo de inversionista y botón de decisión,
(4) definición de MVP con bloques editables,
(5) paquete comercializable: landing, paquetes, marketing, lanzamiento y prompt
maestro para Claude Code.

Stack: Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui, Firebase Auth (Google) +
Firestore, @anthropic-ai/sdk server-side con claude-opus-4-8, thinking adaptativo,
streaming, structured outputs (Zod), web_search_20260209 solo en etapa 2 con
max_uses acotado, prompt caching en system prompts, contador de tokens por proyecto.

Principios: simple y efectivo; la honestidad de la validación es el producto; todo
resultado estructurado es editable por el emprendedor; la API key nunca llega al
cliente; español en toda la UI y los entregables.

Construye por fases (esqueleto+auth → etapa 1 → etapa 2 → etapa 3 → etapas 4-5 →
pulido), dejando cada fase funcional y probable antes de seguir.
```

---

## 7. Lo que necesito de ti para arrancar

1. **Tu aprobación de este plan** (o los cambios que quieras).
2. **Repo nuevo:** intentaré crear `jorgeporrasmx/valida-tu-idea` desde aquí; si mis permisos de GitHub no alcanzan (esta sesión está limitada a factura-mis-gastos), te pediré crearlo tú y abrir una sesión de Claude Code apuntada a él.
3. **Proyecto de Firebase** nuevo (o me confirmas si reusamos tu cuenta actual con un proyecto separado) — necesitaré las credenciales como variables de entorno.
4. **API key de Anthropic** para el servidor (variable `ANTHROPIC_API_KEY` en Vercel/local — nunca en el código).

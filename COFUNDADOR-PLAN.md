# COFUNDADOR — Plan del MVP de uso personal

> Herramienta personal de Jorge para validar sus propias ideas de negocio y decidir cuáles merecen convertirse en un MVP real. **No es un negocio: es el filtro que protege tu tiempo y tu dinero.** Versión 2.0 — reemplaza al plan anterior (valida-tu-idea) tras descubrir que ese nombre y concepto ya existen como producto comercial (valida-tu-idea.com).

**Nombre provisional:** `cofundador` (repo: `cofundador`). Puedes renombrarlo cuando quieras — al ser de uso personal, el nombre no es una decisión crítica.

---

## 1. Propósito y métrica de éxito

- **Para quién:** un solo usuario — tú.
- **Para qué:** pasar cada idea tuya por un filtro riguroso (entrevista → investigación real → abogado del diablo) y, solo si sobrevive, generar el paquete para construir su MVP con Claude Code.
- **Éxito significa:** ideas malas descartadas a tiempo, e ideas buenas convertidas en MVPs con cliente, dolor y monetización claros. Cero métricas de negocio para la herramienta en sí.

Lo que este giro elimina de tajo: pagos, planes, onboarding, landing comercial, protección anti-abuso, multi-usuario, y la presión de competir con valida-tu-idea.com. Lo que gana: un **portafolio comparativo de tus ideas**, que como emprendedor de varias ideas es justo lo que necesitas.

---

## 2. Las 5 etapas (esencia intacta, reenfocada a ti)

### Etapa 1 — Entrevista: clarificar la idea
Chat con streaming donde Claude te entrevista una pregunta a la vez, profundizando cuando la respuesta es vaga. Las 9 preguntas clave:

1. **La idea en una frase** (elevator pitch)
2. **El problema** — la última vez que viste a alguien sufrirlo
3. **El cliente ideal** — con nombre, ocupación y contexto
4. **La alternativa actual** — cómo lo resuelven hoy (Excel, WhatsApp, o nada)
5. **El modelo de dinero** — quién paga, cuánto y cada cuándo
6. **La diferencia** — por qué tú, qué tienes que otros no
7. **La analogía** — "soy el ___ de ___"
8. **El porqué ahora** — qué cambió para que funcione hoy
9. **El primer paso** — lo mínimo para el primer cliente pagando

**Salida:** Ficha de Idea estructurada y **editable** (structured outputs con Zod).

### Etapa 2 — Investigación: ¿ya existe? ¿vale la pena?
Claude investiga con **búsqueda web real** (fuentes citadas): las 3–7 empresas más parecidas, precios, tracción visible, tamaño de mercado y señales de demanda. Veredicto **semáforo con puntaje (0–100)**:
- 🟢 Verde — hay espacio; continúa.
- 🟡 Amarillo — necesita un giro (pivote sugerido explícito).
- 🔴 Rojo — saturado o el problema no existe; por qué, con datos.

*Lección incorporada del caso valida-tu-idea.com: la investigación siempre verifica si el nombre/dominio pensado ya está ocupado por un competidor.*

Puedes avanzar incluso en rojo, pero el veredicto queda registrado en el portafolio.

### Etapa 3 — Abogado del diablo
Claude cambia de rol y trata de convencerte de NO hacerlo: las 5 razones de fracaso más probables, específicas a esa idea y apoyadas en la investigación (incluye siempre **costo de oportunidad**: qué dejarías de atender por perseguir esto). Conversación franca de contra-argumentos; cierre con "objeciones respondidas vs. abiertas" y **botón de decisión**: "Decido continuar" / "La archivo".

### Etapa 4 — Definición del MVP
Todo editable por bloques: cliente ideal afinado, propuesta de valor en una frase, las 3 funciones mínimas (y qué queda fuera), precio y modelo de cobro, cómo conseguir los primeros 5 clientes, métrica de éxito a 30 días, riesgos aceptados.

### Etapa 5 — Paquete de construcción
*(Antes "paquete comercializable" — el reenfoque: el destinatario eres tú y Claude Code, no un cliente que paga por el paquete.)*

1. **Prompt maestro para Claude Code** — autocontenido, con la especificación del MVP lista para pegar y construir. **Es el entregable estrella.**
2. Copy completo de landing para ESE MVP (titular, dolores, oferta, CTA, FAQ).
3. Paquetes/precios sugeridos con justificación.
4. Estrategia de marketing para ese cliente ideal.
5. Plan de lanzamiento de 30 días, semana a semana.

Todo descargable en Markdown y guardado en el proyecto.

---

## 3. El Portafolio (nueva pieza central para uso personal)

Pantalla de inicio: **todas tus ideas en una tabla comparable** — nombre, etapa alcanzada, semáforo, puntaje, decisión tomada, fecha, costo de API acumulado. Ideas archivadas incluidas (un cementerio de ideas descartadas a tiempo es evidencia de que la herramienta funciona). De aquí decides cuál MVP construir siguiente.

---

## 4. Stack técnico (simplificado)

| Capa | Elección | Cambio vs. plan anterior |
|---|---|---|
| Framework | Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui | Igual |
| Auth | Firebase Auth (Google) **restringido por allowlist a tu correo** | Antes: registro abierto. Ahora: solo tú entras aunque la URL sea pública |
| Datos | Firestore | Igual (sincroniza entre tus dispositivos) |
| IA | `@anthropic-ai/sdk` server-side, `claude-opus-4-8`, thinking adaptativo, streaming, structured outputs, `web_search_20260209` solo en etapa 2 con `max_uses` acotado, prompt caching | Igual — al ser uso personal, usar el mejor modelo sin culpa: $1–3 USD por validación completa se paga solo si te evita UN mal proyecto |
| Deploy | Vercel | Igual |
| Control de gasto | Contador de tokens/búsquedas por idea, visible en el portafolio | Antes era anti-abuso; ahora es solo visibilidad |

### Modelo de datos (Firestore)

```
ideas/{ideaId}
  ├─ nombre, etapaActual (1–5), semaforo, puntaje, decision, createdAt
  ├─ fichaIdea { pitch, problema, clienteIdeal, alternativas, modeloDinero,
  │              diferenciador, analogia, timing, primerPaso }        ← editable
  ├─ investigacion { competidores[], veredicto, puntaje, fuentes[], dominioLibre }
  ├─ abogadoDelDiablo { objeciones[], respondidas[], abiertas[], decision }
  ├─ mvp { propuestaValor, funciones[], fuera[], precio, primeros5, metrica30d, riesgos[] } ← editable
  ├─ paquete { promptMaestro, landing, precios, marketing, lanzamiento }
  ├─ chats/{etapa} → historial por etapa
  └─ uso { tokensEntrada, tokensSalida, busquedas, costoUsd }
```

### Pantallas (3, no más)

1. **Portafolio** — tabla de ideas + "Nueva idea".
2. **Wizard de 5 etapas** — chat streaming a la izquierda, resultados estructurados editables a la derecha (tabs en móvil), barra de progreso.
3. **Paquete final** — vista del entregable con botón de copiar el prompt maestro y descargar todo en Markdown.

---

## 5. Plan de construcción

| Fase | Entregable | Lo pruebas con |
|---|---|---|
| 1 | Repo nuevo + Next.js + login restringido + portafolio vacío | Entrar y crear una idea |
| 2 | Etapa 1: entrevista + Ficha editable | Una idea real tuya |
| 3 | Etapa 2: investigación web + semáforo con fuentes | Ver competidores reales (caso de prueba: esta misma herramienta contra valida-tu-idea.com) |
| 4 | Etapa 3: abogado del diablo + decisión | La conversación difícil |
| 5 | Etapas 4–5 + portafolio completo + costos + deploy | Flujo de punta a punta |

**Primera prueba de fuego sugerida:** pasar por la herramienta las ideas que ya tienes en cartera. Si el portafolio te ordena bien cuál construir primero, la herramienta cumplió.

**Fuera del alcance (deliberado):** pagos, multi-usuario, inglés, generación real de código (el prompt maestro es el puente), apps móviles. Si algún día decides comercializar, la base queda lista — pero esa decisión pasará primero por esta misma herramienta.

---

## 6. Prompt maestro para iniciar el desarrollo

```
Construye "cofundador", una app web de USO PERSONAL (un solo usuario) para validar
ideas de negocio y generar el paquete de construcción de los MVPs que valgan la pena.
Sigue el documento COFUNDADOR-PLAN.md.

Flujo: portafolio de ideas → wizard de 5 etapas por idea:
(1) entrevista guiada con 9 preguntas clave → Ficha de Idea editable,
(2) investigación de competidores con búsqueda web real, fuentes citadas y veredicto
    semáforo con puntaje 0–100 (incluye verificar si el nombre/dominio ya está ocupado),
(3) abogado del diablo con tono directo de inversionista, incluye costo de oportunidad,
    y botón de decisión continuar/archivar,
(4) definición de MVP con bloques editables,
(5) paquete de construcción: prompt maestro para Claude Code (entregable estrella),
    copy de landing, precios, marketing y plan de lanzamiento de 30 días,
    todo descargable en Markdown.

Stack: Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui; Firebase Auth (Google) con
allowlist de un solo correo; Firestore; @anthropic-ai/sdk server-side con
claude-opus-4-8, thinking adaptativo, streaming, structured outputs (Zod),
web_search_20260209 solo en etapa 2 con max_uses acotado, prompt caching en system
prompts, y contador de tokens/costo por idea visible en el portafolio.

Principios: simple y efectivo; español en todo; la honestidad del veredicto es el
valor (la herramienta existe para descartar ideas malas, no para animar); todo
resultado estructurado es editable; la API key nunca llega al cliente.

Construye por fases (esqueleto+auth+portafolio → etapa 1 → etapa 2 → etapa 3 →
etapas 4-5+pulido), dejando cada fase funcional y probable antes de seguir.
```

---

## 7. Para arrancar necesito de ti

1. **Luz verde a este plan** (o tus ajustes).
2. **Repo nuevo `cofundador`** — esta sesión tiene GitHub limitado a factura-mis-gastos; lo más práctico es que crees el repo y abras una sesión de Claude Code apuntada a él con el prompt de la sección 6. Puedo intentar crearlo desde aquí si prefieres.
3. **Proyecto de Firebase** (nuevo o uno separado en tu cuenta actual) — credenciales como variables de entorno.
4. **`ANTHROPIC_API_KEY`** para el servidor (en Vercel/local, nunca en el código).

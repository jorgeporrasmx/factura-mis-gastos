// exercises/squat.js
// Definición declarativa de la SENTADILLA. Es el "modelo" de lo que es una
// buena sentadilla, en datos. El motor (evaluator.js) lo ejecuta.
//
// Para añadir otro ejercicio (flexión, peso muerto, curl) se copia esta
// estructura: computeMetrics + repTracking + liveChecks + repChecks.

import {
  LM,
  angle,
  inclinationFromVertical,
  midpoint,
  isVisible,
} from "../geometry.js";

const SEVERITY = { OK: "ok", WARN: "warn", ERROR: "error" };

// --- Umbrales (ajustables / calibrables por usuario en el futuro) ---
const TH = {
  // Entrada a fase "abajo" en cuanto las rodillas se flexionan (inicio de bajada).
  // Debe ser MAYOR que DEPTH_PARTIAL para que una rep corta se registre y se
  // pueda rechazar por poca profundidad (si fuese <120, sería inalcanzable).
  KNEE_DOWN: 140,
  KNEE_UP: 160, // por encima, "arriba" (de pie). Histéresis entre ambos.
  DEPTH_GOOD: 95, // muslo paralelo/por debajo ≈ rodilla ~90°
  DEPTH_PARTIAL: 120, // entre GOOD y esto: profundidad parcial
  TORSO_LEAN_MAX: 55, // inclinación máx del torso vs vertical antes de avisar
  VALGUS_RATIO: 0.55, // rodilla "metida" respecto al ancho de cadera/tobillo
  REP_FAST_MS: 900, // bajar+subir más rápido que esto = sin control
  REP_SLOW_MS: 8000, // más lento que esto probablemente no es una rep real
  SYMMETRY_MAX_DEG: 18, // diferencia máx aceptable entre rodilla izq y der
};

/** Calcula un ángulo de rodilla por lado, promediando los visibles. */
function kneeAngle(lm) {
  const left = isVisible(lm[LM.LEFT_HIP]) && isVisible(lm[LM.LEFT_KNEE]) && isVisible(lm[LM.LEFT_ANKLE])
    ? angle(lm[LM.LEFT_HIP], lm[LM.LEFT_KNEE], lm[LM.LEFT_ANKLE]) : null;
  const right = isVisible(lm[LM.RIGHT_HIP]) && isVisible(lm[LM.RIGHT_KNEE]) && isVisible(lm[LM.RIGHT_ANKLE])
    ? angle(lm[LM.RIGHT_HIP], lm[LM.RIGHT_KNEE], lm[LM.RIGHT_ANKLE]) : null;
  return { left, right };
}

export const squat = {
  id: "squat",
  name: "Sentadilla",
  emoji: "🏋️",
  // Guía de encuadre: la vista define qué checks son fiables.
  setup:
    "Coloca el celular a ~3 m, a la altura de la cadera, en vista lateral o " +
    "45°. Debe verse todo el cuerpo: cabeza a tobillos.",

  /**
   * Devuelve el set de métricas que necesitan tracking y checks.
   * Si no hay puntos clave suficientes, devuelve null (frame no evaluable).
   */
  computeMetrics(lm) {
    const knees = kneeAngle(lm);
    const kneeAvg =
      knees.left != null && knees.right != null
        ? (knees.left + knees.right) / 2
        : knees.left ?? knees.right;
    if (kneeAvg == null) return null;

    const shoulder = midpoint(lm[LM.LEFT_SHOULDER], lm[LM.RIGHT_SHOULDER]);
    const hip = midpoint(lm[LM.LEFT_HIP], lm[LM.RIGHT_HIP]);
    const torsoLean = shoulder && hip ? inclinationFromVertical(shoulder, hip) : null;

    const hipAngle =
      shoulder && hip && isVisible(lm[LM.LEFT_KNEE])
        ? angle(shoulder, hip, lm[LM.LEFT_KNEE])
        : null;

    // Valgo de rodilla (rodillas hacia dentro). Solo fiable en vista frontal.
    // Ratio = separación entre rodillas / separación entre tobillos.
    // <1 => rodillas más juntas que los tobillos (posible valgo).
    let valgusRatio = null;
    const lk = lm[LM.LEFT_KNEE], rk = lm[LM.RIGHT_KNEE];
    const la = lm[LM.LEFT_ANKLE], ra = lm[LM.RIGHT_ANKLE];
    if (isVisible(lk) && isVisible(rk) && isVisible(la) && isVisible(ra)) {
      const kneeWidth = Math.abs(lk.x - rk.x);
      const ankleWidth = Math.abs(la.x - ra.x);
      if (ankleWidth > 0.02) valgusRatio = kneeWidth / ankleWidth;
    }

    return {
      kneeAngle: kneeAvg,
      kneeLeft: knees.left,
      kneeRight: knees.right,
      torsoLean,
      hipAngle,
      valgusRatio,
    };
  },

  // El conteo de reps sigue el ángulo de rodilla con histéresis.
  repTracking: { metric: "kneeAngle", downBelow: TH.KNEE_DOWN, upAbove: TH.KNEE_UP },

  // --- Checks instantáneos (postura mientras se mueve) ---
  liveChecks: [
    {
      id: "torso",
      evaluate(m) {
        if (m.torsoLean == null) return null;
        if (m.torsoLean > TH.TORSO_LEAN_MAX)
          return { id: "torso", severity: SEVERITY.WARN, message: "Pecho arriba: te inclinas demasiado al frente." };
        return { id: "torso", severity: SEVERITY.OK };
      },
    },
    {
      id: "valgus_live",
      evaluate(m) {
        if (m.valgusRatio == null) return null;
        if (m.valgusRatio < TH.VALGUS_RATIO)
          return { id: "valgus_live", severity: SEVERITY.WARN, message: "Abre las rodillas, se meten hacia dentro." };
        return { id: "valgus_live", severity: SEVERITY.OK };
      },
    },
  ],

  // --- Checks al cerrar cada repetición ---
  repChecks: [
    {
      id: "depth",
      evaluate(rep) {
        const bottom = rep.minMetric;
        if (bottom <= TH.DEPTH_GOOD)
          return { id: "depth", severity: SEVERITY.OK, message: "Profundidad correcta." };
        if (bottom <= TH.DEPTH_PARTIAL)
          return { id: "depth", severity: SEVERITY.WARN, message: "Baja un poco más para llegar a paralelo." };
        return { id: "depth", severity: SEVERITY.ERROR, message: "Sentadilla muy corta: no cuenta. Baja más." };
      },
    },
    {
      id: "tempo",
      evaluate(rep) {
        if (rep.durationMs < TH.REP_FAST_MS)
          return { id: "tempo", severity: SEVERITY.WARN, message: "Más lento y controlado, sobre todo al bajar." };
        if (rep.durationMs > TH.REP_SLOW_MS)
          return { id: "tempo", severity: SEVERITY.WARN, message: "Repetición muy lenta o pausada." };
        return { id: "tempo", severity: SEVERITY.OK, message: "Buen tempo." };
      },
    },
    {
      id: "symmetry",
      evaluate(rep) {
        const b = rep.bottomMetrics;
        if (!b || b.kneeLeft == null || b.kneeRight == null) return null;
        const diff = Math.abs(b.kneeLeft - b.kneeRight);
        if (diff > TH.SYMMETRY_MAX_DEG)
          return { id: "symmetry", severity: SEVERITY.WARN, message: "Cargas más una pierna que la otra." };
        return { id: "symmetry", severity: SEVERITY.OK };
      },
    },
  ],

  thresholds: TH,
};

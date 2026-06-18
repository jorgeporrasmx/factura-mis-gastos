// evaluator.js
// Motor GENÉRICO de evaluación de ejercicios.
// No sabe nada de sentadillas en concreto: recibe una "config de ejercicio"
// (ver exercises/squat.js) y aplica:
//   1. cálculo de métricas (ángulos) a partir de los landmarks,
//   2. una máquina de estados con histéresis para contar repeticiones,
//   3. checks de técnica "en vivo" (cada frame) y "por repetición".
//
// Añadir un ejercicio nuevo = añadir una config, NO tocar este archivo.

import { Smoother } from "./geometry.js";

const SEVERITY = { OK: "ok", WARN: "warn", ERROR: "error" };

export class ExerciseEvaluator {
  /** @param {object} config config declarativa del ejercicio */
  constructor(config) {
    this.config = config;
    this.smoothers = {}; // un EMA por métrica
    this.reset();
  }

  reset() {
    this.phase = "unknown"; // 'up' | 'down' | 'unknown'
    this.reps = 0;
    this.currentRep = null; // acumulador de la rep en curso
    this.lastReps = []; // historial de reps finalizadas (con su evaluación)
    this.liveFeedback = []; // avisos del frame actual
    this.repFeedback = []; // resultado de la última rep
    this.metrics = {};
    for (const key of Object.keys(this.smoothers)) this.smoothers[key].reset();
  }

  _smooth(name, value) {
    if (!this.smoothers[name]) this.smoothers[name] = new Smoother(0.4);
    return this.smoothers[name].push(value);
  }

  /**
   * Procesa un frame.
   * @param {Array} landmarks 33 landmarks de MediaPipe (o null si no hay persona)
   * @param {number} now timestamp en ms (performance.now())
   * @returns {object} estado actual para pintar en la UI
   */
  update(landmarks, now) {
    this.liveFeedback = [];

    if (!landmarks) {
      return this._snapshot("No te veo completo. Colócate frente a la cámara.");
    }

    // 1) Métricas crudas -> suavizadas.
    const raw = this.config.computeMetrics(landmarks);
    if (!raw) {
      return this._snapshot("Cuerpo no visible por completo. Aléjate o reencuadra.");
    }
    const m = {};
    for (const [k, v] of Object.entries(raw)) m[k] = v === null ? null : this._smooth(k, v);
    this.metrics = m;

    // 2) Máquina de estados de repeticiones.
    this._trackReps(m, now);

    // 3) Checks "en vivo" (postura instantánea).
    for (const check of this.config.liveChecks || []) {
      const r = check.evaluate(m);
      if (r && r.severity !== SEVERITY.OK) this.liveFeedback.push(r);
    }

    return this._snapshot();
  }

  _trackReps(m, now) {
    const t = this.config.repTracking;
    const value = m[t.metric];
    if (value === null || value === undefined) return;

    // Acumula extremos durante la rep para evaluarla al cerrar.
    if (this.currentRep) {
      this.currentRep.minMetric = Math.min(this.currentRep.minMetric, value);
      this.currentRep.maxMetric = Math.max(this.currentRep.maxMetric, value);
      // Guarda el "fondo" del movimiento para checks por rep (p. ej. profundidad).
      if (value <= this.currentRep.minMetric) this.currentRep.bottomMetrics = { ...m };
    }

    // Histéresis: dos umbrales separados evitan rebotes en el límite.
    if (this.phase !== "down" && value < t.downBelow) {
      this.phase = "down";
      this.currentRep = {
        startedAt: now,
        minMetric: value,
        maxMetric: value,
        bottomMetrics: { ...m },
      };
    } else if (this.phase === "down" && value > t.upAbove) {
      // Cierre de repetición.
      this.phase = "up";
      if (this.currentRep) {
        this.currentRep.endedAt = now;
        this.currentRep.durationMs = now - this.currentRep.startedAt;
        this._finishRep(this.currentRep);
        this.currentRep = null;
      }
    }
  }

  _finishRep(rep) {
    const results = [];
    for (const check of this.config.repChecks || []) {
      const r = check.evaluate(rep, this.config);
      if (r) results.push(r);
    }
    const hasError = results.some((r) => r.severity === SEVERITY.ERROR);
    const hasWarn = results.some((r) => r.severity === SEVERITY.WARN);

    // Solo contamos como rep válida si no hubo un error grave de técnica.
    if (!hasError) this.reps += 1;

    const summary = {
      index: this.lastReps.length + 1,
      counted: !hasError,
      quality: hasError ? "error" : hasWarn ? "warn" : "ok",
      durationMs: Math.round(rep.durationMs),
      results,
    };
    this.lastReps.push(summary);
    this.repFeedback = results.filter((r) => r.severity !== SEVERITY.OK);
  }

  _snapshot(blockingMessage) {
    return {
      phase: this.phase,
      reps: this.reps,
      metrics: this.metrics,
      liveFeedback: this.liveFeedback,
      repFeedback: this.repFeedback,
      lastRep: this.lastReps[this.lastReps.length - 1] || null,
      blockingMessage: blockingMessage || null,
    };
  }
}

export { SEVERITY };

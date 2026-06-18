// geometry.js
// Utilidades geométricas puras sobre landmarks de pose.
// Un landmark es { x, y, z, visibility } con x/y normalizados (0..1).
// Todo este módulo es agnóstico al ejercicio: solo matemáticas.

/** Índices de los 33 puntos de BlazePose/MediaPipe Pose que usamos. */
export const LM = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

/**
 * Ángulo (en grados) en el vértice `b` formado por los segmentos b->a y b->c.
 * Usa solo el plano 2D (x,y), que es lo robusto para una cámara monocular.
 */
export function angle(a, b, c) {
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;
  const dot = abx * cbx + aby * cby;
  const magAb = Math.hypot(abx, aby);
  const magCb = Math.hypot(cbx, cby);
  if (magAb === 0 || magCb === 0) return null;
  let cos = dot / (magAb * magCb);
  cos = Math.min(1, Math.max(-1, cos));
  return (Math.acos(cos) * 180) / Math.PI;
}

/**
 * Inclinación de un segmento respecto a la vertical, en grados.
 * 0° = perfectamente vertical, 90° = horizontal. Útil para el torso.
 */
export function inclinationFromVertical(top, bottom) {
  const dx = top.x - bottom.x;
  const dy = top.y - bottom.y;
  const fromVertical = Math.atan2(Math.abs(dx), Math.abs(dy));
  return (fromVertical * 180) / Math.PI;
}

/** ¿Es confiable este punto? MediaPipe entrega visibility 0..1. */
export function isVisible(lm, threshold = 0.5) {
  return lm && (lm.visibility === undefined || lm.visibility >= threshold);
}

/** Promedio de varios landmarks (centro de masa simple). */
export function midpoint(...points) {
  const valid = points.filter(Boolean);
  if (!valid.length) return null;
  return {
    x: valid.reduce((s, p) => s + p.x, 0) / valid.length,
    y: valid.reduce((s, p) => s + p.y, 0) / valid.length,
    z: valid.reduce((s, p) => s + (p.z || 0), 0) / valid.length,
    visibility: Math.min(...valid.map((p) => p.visibility ?? 1)),
  };
}

/**
 * Suavizador exponencial (EMA). La pose tiene jitter frame a frame;
 * sin esto los ángulos parpadean y la máquina de estados cuenta de más.
 */
export class Smoother {
  constructor(alpha = 0.4) {
    this.alpha = alpha;
    this.value = null;
  }
  push(v) {
    if (v === null || v === undefined || Number.isNaN(v)) return this.value;
    this.value = this.value === null ? v : this.alpha * v + (1 - this.alpha) * this.value;
    return this.value;
  }
  reset() {
    this.value = null;
  }
}

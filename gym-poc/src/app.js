// app.js
// Orquestación: une cámara/pose + motor de evaluación + UI.
import { PoseSource } from "./pose.js";
import { ExerciseEvaluator } from "./evaluator.js";
import { EXERCISES, DEFAULT_EXERCISE } from "./exercises/index.js";

const el = (id) => document.getElementById(id);

const ui = {
  video: el("video"),
  canvas: el("overlay"),
  start: el("startBtn"),
  stop: el("stopBtn"),
  select: el("exerciseSelect"),
  reps: el("reps"),
  phase: el("phase"),
  knee: el("kneeAngle"),
  torso: el("torsoLean"),
  feedback: el("feedback"),
  lastRep: el("lastRep"),
  status: el("status"),
  setupHint: el("setupHint"),
};

let pose = null;
let evaluator = null;

function buildExerciseOptions() {
  for (const ex of Object.values(EXERCISES)) {
    const opt = document.createElement("option");
    opt.value = ex.id;
    opt.textContent = `${ex.emoji} ${ex.name}`;
    ui.select.appendChild(opt);
  }
  ui.select.value = DEFAULT_EXERCISE;
  ui.setupHint.textContent = EXERCISES[DEFAULT_EXERCISE].setup;
}

function loadExercise(id) {
  evaluator = new ExerciseEvaluator(EXERCISES[id]);
  ui.setupHint.textContent = EXERCISES[id].setup;
  render(evaluator._snapshot());
}

function fmt(v, suffix = "°") {
  return v == null ? "—" : `${Math.round(v)}${suffix}`;
}

function render(s) {
  ui.reps.textContent = s.reps;
  ui.phase.textContent =
    s.phase === "down" ? "Abajo" : s.phase === "up" ? "Arriba" : "—";
  ui.knee.textContent = fmt(s.metrics.kneeAngle);
  ui.torso.textContent = fmt(s.metrics.torsoLean);

  // Feedback en vivo (postura instantánea).
  const items = [];
  if (s.blockingMessage)
    items.push(`<li class="warn">⚠️ ${s.blockingMessage}</li>`);
  for (const f of s.liveFeedback)
    items.push(`<li class="${f.severity}">• ${f.message}</li>`);
  ui.feedback.innerHTML =
    items.length ? items.join("") : '<li class="ok">✓ Técnica correcta</li>';

  // Resumen de la última repetición.
  if (s.lastRep) {
    const r = s.lastRep;
    const badge =
      r.quality === "ok" ? "✅" : r.quality === "warn" ? "🟡" : "❌";
    const notes = r.results
      .filter((x) => x.severity !== "ok" && x.message)
      .map((x) => x.message)
      .join(" · ");
    ui.lastRep.innerHTML = `${badge} Rep ${r.index} · ${(r.durationMs / 1000).toFixed(1)}s${
      r.counted ? "" : " (no contada)"
    }${notes ? `<br><span class="muted">${notes}</span>` : ""}`;
  }
}

async function start() {
  ui.start.disabled = true;
  ui.status.textContent = "Cargando modelo de pose (on-device)…";
  try {
    pose = new PoseSource(ui.video, ui.canvas);
    await pose.init();
    ui.status.textContent = "Pide permiso de cámara…";
    pose.onResults = (landmarks, now) => render(evaluator.update(landmarks, now));
    await pose.startCamera();
    ui.status.textContent = "En vivo · todo se procesa en tu dispositivo 🔒";
    ui.stop.disabled = false;
  } catch (e) {
    console.error(e);
    ui.status.textContent = `Error: ${e.message}. Requiere HTTPS o localhost y permiso de cámara.`;
    ui.start.disabled = false;
  }
}

function stop() {
  pose?.stop();
  ui.stop.disabled = true;
  ui.start.disabled = false;
  ui.status.textContent = "Detenido.";
}

ui.select.addEventListener("change", (e) => loadExercise(e.target.value));
ui.start.addEventListener("click", start);
ui.stop.addEventListener("click", stop);

buildExerciseOptions();
loadExercise(DEFAULT_EXERCISE);

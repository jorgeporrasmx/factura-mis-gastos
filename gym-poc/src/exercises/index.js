// exercises/index.js
// Registro de ejercicios disponibles. Añadir uno nuevo = importarlo aquí.
import { squat } from "./squat.js";

export const EXERCISES = {
  [squat.id]: squat,
};

export const DEFAULT_EXERCISE = squat.id;

export const CONTINUE_PHRASES = Object.freeze([
  "Continúa.", "Sigue trabajando.", "Continúa con el siguiente paso.",
  "Sigue adelante.", "Continúa con el proyecto.", "Sigue trabajando en ello.",
  "Continúa donde te quedaste.", "Avanza con la siguiente fase.",
  "Prosigue con el trabajo.", "Sigue con la implementación.",
  "Continúa con lo planificado.", "Avanza con el siguiente punto.",
  "Sigue desarrollando el proyecto.", "Continúa con la tarea pendiente.",
  "Prosigue con la siguiente etapa.", "Sigue ejecutando el plan.",
  "Continúa con el trabajo pendiente.", "Avanza con lo que sigue.",
  "Sigue con el siguiente paso del plan.", "Continúa hasta completar la siguiente parte."
]);

export function randomContinuePhrase(random = Math.random) {
  return CONTINUE_PHRASES[Math.floor(random() * CONTINUE_PHRASES.length)];
}

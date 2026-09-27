export const TERMINAL_STATES = Object.freeze({ CONTINUE: "CONTINÚO", ALERT: "ALERTA", UNKNOWN: "UNKNOWN" });

function normalizeLine(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function parseTerminalState(text) {
  const lines = String(text ?? "").split(/\r?\n/).map(normalizeLine).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i].replace(/[*_]/g, "").trim().toUpperCase();
    if (/^CONTINÚO[.!]?$/.test(line)) return TERMINAL_STATES.CONTINUE;
    if (/^ALERTA[.!]?$/.test(line)) return TERMINAL_STATES.ALERT;
  }
  return TERMINAL_STATES.UNKNOWN;
}

export function hasRequiredTerminalState(text, expected) {
  return parseTerminalState(text) === expected;
}

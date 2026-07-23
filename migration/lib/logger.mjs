// Structured, append-only migration logger. Records to memory (for the report)
// and echoes to stdout/stderr. No secrets, no file bytes, no MongoDB.

export function createLogger(options = {}) {
  const quiet = Boolean(options.quiet);
  const entries = [];

  function log(level, message, context) {
    const entry = { at: new Date().toISOString(), level, message, context };
    entries.push(entry);
    if (quiet) return;
    const line = `[${entry.level.toUpperCase()}] ${message}`;
    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.log(line);
  }

  return {
    info: (m, c) => log('info', m, c),
    warn: (m, c) => log('warn', m, c),
    error: (m, c) => log('error', m, c),
    getEntries: () => entries.slice(),
  };
}

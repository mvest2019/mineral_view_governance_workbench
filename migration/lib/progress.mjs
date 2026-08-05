// Progress reporting — lightweight, line-based. No dependencies. Safe to no-op
// when quiet.

export function createProgress(options = {}) {
  const quiet = Boolean(options.quiet);
  return {
    start(collection, total) {
      if (!quiet) console.log(`  … ${collection}: processing ${total} record(s)`);
    },
    tick(done, total, collection) {
      if (quiet) return;
      if (total > 0 && (done === total || done % 50 === 0)) {
        console.log(`    ${collection}: ${done}/${total}`);
      }
    },
    done(collection) {
      if (!quiet) console.log(`  ✔ ${collection}: read complete`);
    },
  };
}

import { isValidTimeZone, localTimeInZone } from './core/simulate.js';

// Scaffold-stage smoke check: confirms the core module loads and resolves
// a real IANA time zone in the browser. The interactive form/heatmap
// replace this in the build phase.
const now = new Date();
const zone = 'America/Los_Angeles';

if (isValidTimeZone(zone)) {
  const { hour, minute } = localTimeInZone(now, zone);
  console.log(`Fair Hours scaffold running. Right now in ${zone}: ${hour}:${String(minute).padStart(2, '0')}`);
}

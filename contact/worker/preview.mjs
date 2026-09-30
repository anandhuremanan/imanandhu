// Renders the acknowledgement to disk for visual review. Not part of the build.
import { writeFileSync } from 'node:fs';
const { renderAck } = await import('./src/message.ts');
const { keralaNow } = await import('./src/kerala.ts');
const OUT = process.env.OUT || '.';
const env = { MAIL_FROM: 'Portfolio <contact@imanandhu.in>', MAIL_TO: 'mails@imanandhu.in' };
const msg = {
  name: 'Asha Nair', email: 'asha@example.com',
  message: "Hi Anandhu \u2014 I came across Web Scanner and the certificate-transparency angle is clever.\n\nWe're a small team and we'd love to talk about a contract. Are you taking work in November?"
};
const HOURS = { night: '2026-09-30T16:30:00Z', dawn: '2026-09-30T01:30:00Z', day: '2026-09-30T06:30:00Z', dusk: '2026-09-30T13:30:00Z' };
for (const [k, iso] of Object.entries(HOURS)) {
  writeFileSync(`${OUT}/ack-${k}.html`, renderAck(msg, env, keralaNow(new Date(iso))).html);
}
writeFileSync(`${OUT}/ack.txt`, renderAck(msg, env, keralaNow(new Date(HOURS.dusk))).text);
console.log('written');

/**
 * A few seconds of speech-like audio made in the browser (a pitch-wandering
 * tone with syllable-shaped bursts), so the audio demos need no media files.
 */
export function makeDemoAudio(seconds = 6, rate = 16_000): { url: string; peaks: number[] } {
  const n = Math.floor(seconds * rate);
  const samples = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    const syllable = Math.max(0, Math.sin(Math.PI * ((t * 3.1) % 1))) ** 1.5;
    const pause = Math.sin(t * 2.2) > -0.8 ? 1 : 0.15;
    const pitch = 150 + 40 * Math.sin(t * 2.3) + 18 * Math.sin(t * 7.1);
    phase += (2 * Math.PI * pitch) / rate;
    samples[i] =
      0.5 *
      syllable *
      pause *
      (Math.sin(phase) + 0.35 * Math.sin(2 * phase) + 0.15 * Math.sin(3 * phase));
  }
  const buffer = new ArrayBuffer(44 + n * 2);
  const view = new DataView(buffer);
  const str = (o: number, s: string) =>
    [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF');
  view.setUint32(4, 36 + n * 2, true);
  str(8, 'WAVEfmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  str(36, 'data');
  view.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++)
    view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, samples[i] ?? 0)) * 0x7fff, true);
  const bars = 56;
  const size = Math.floor(n / bars);
  const raw = Array.from({ length: bars }, (_, b) => {
    let max = 0;
    for (let i = b * size; i < (b + 1) * size; i++) max = Math.max(max, Math.abs(samples[i] ?? 0));
    return max;
  });
  const top = Math.max(...raw) || 1;
  const url =
    typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
      ? URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }))
      : '';
  return { url, peaks: raw.map((p) => p / top) };
}

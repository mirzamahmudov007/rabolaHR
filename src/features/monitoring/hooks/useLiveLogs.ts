import { useEffect, useRef, useState } from 'react';
import { liveTemplates } from '@/features/monitoring/data/faceLogs';
import type { FaceLog } from '@/features/monitoring/types/faceLog';

const toSeconds = (t: string) => {
  const [h, m, s] = t.split(':').map(Number);
  return h * 3600 + m * 60 + s;
};
const fromSeconds = (n: number) =>
[Math.floor(n / 3600) % 24, Math.floor(n / 60) % 60, n % 60].map((v) => String(v).padStart(2, '0')).join(':');

/** Simulates a real-time Face ID event stream. */
export function useLiveLogs(initial: FaceLog[], enabled: boolean) {
  const [logs, setLogs] = useState<FaceLog[]>(initial);
  const [freshId, setFreshId] = useState<string | null>(null);
  const counter = useRef(1050);
  const clock = useRef(toSeconds(initial[0]?.time ?? '14:40:00'));

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setInterval(() => {
      const template = liveTemplates[counter.current % liveTemplates.length];
      clock.current += 45 + Math.floor(Math.random() * 120);
      const log: FaceLog = { ...template, id: `EV-${counter.current++}`, time: fromSeconds(clock.current) };
      setLogs((prev) => [log, ...prev]);
      setFreshId(log.id);
    }, 9000);
    return () => window.clearInterval(timer);
  }, [enabled]);

  return { logs, freshId };
}
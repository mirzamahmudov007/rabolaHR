export type LogEvent = 'in' | 'out' | 'unknown';

export interface FaceLog {
  id: string;
  event: LogEvent;
  employeeId?: string;
  time: string;
  camera: string;
  branch: string;
  similarity: number;
  capture: string;
}
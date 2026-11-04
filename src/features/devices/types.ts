export type DeviceStatus = 'online' | 'offline' | 'pending' | 'error';
export type ConnectionMode = 'direct' | 'isup';
export type DeviceKind = 'terminal' | 'camera' | 'doorbell';
/** What the device is mounted to do: entry, exit, or single-terminal check-in/out. */
export type DeviceDirection = 'in' | 'out' | 'both';
export type DeviceAuthMode = 'face' | 'card' | 'faceCard' | 'faceOrCard';

/** On-device parameters the panel can read and push back (ISAPI access-control settings). */
export interface DeviceSettings {
  authMode: DeviceAuthMode;
  /** Recognition distance in meters, 1–10. */
  distance: number;
  /** Similarity threshold percent, 60–99. */
  threshold: number;
  /** Seconds allowed for one attempt, 3–30. */
  timeoutSec: number;
  /** Max enrolled faces the device stores. */
  capacity: number;
  /** Speaker volume 0–10. */
  volume: number;
  /** Screen brightness 0–100. */
  brightness: number;
  /** Unlock relay open time in seconds; absent on devices without a relay. */
  doorOpenSec?: number;
  /** When true the device screen prompts the employee to pick Check In / Check Out. */
  reminder?: boolean;
}

export interface DeviceActivity {
  /** Employee name — an Uzbek mock literal, translate via g(). */
  name: string;
  minutesAgo: number;
  direction: 'in' | 'out';
}

export interface Device {
  id: string;
  /** Display name — an Uzbek mock literal, translate via g(). */
  name: string;
  /** Branch name — an Uzbek mock literal, translate via g(). */
  branch: string;
  kind: DeviceKind;
  direction: DeviceDirection;
  model: string;
  serial: string;
  mode: ConnectionMode;
  status: DeviceStatus;
  /** IP:port for direct devices. */
  host?: string;
  firmware: string;
  /** Minutes since the last reply / event; null = never connected, large values render as hours. */
  lastSeenMinutes: number | null;
  eventsToday: number;
  /** Camera-side httpHosts push pointing at the backend. */
  pushEnabled: boolean;
  settings?: DeviceSettings;
  recent?: DeviceActivity[];
}

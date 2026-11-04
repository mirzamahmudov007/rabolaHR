import type { Device, DeviceSettings } from '@/features/devices/types';

/** Factory defaults for freshly added devices, until the real ones are read back. */
export const DEFAULT_SETTINGS: DeviceSettings = {
  authMode: 'face',
  distance: 3,
  threshold: 90,
  timeoutSec: 10,
  capacity: 3000,
  volume: 5,
  brightness: 50,
  doorOpenSec: 5,
  reminder: true
};

/**
 * Mock fleet. Names, branches and employees are Uzbek literals on purpose —
 * they go through the glossary (g()) so all four locales render them.
 */
export const devices: Device[] = [
{
  id: 'dv-1',
  name: 'Kirish · Asosiy eshik',
  branch: 'Markaziy ofis',
  kind: 'terminal',
  direction: 'in',
  model: 'DS-K1T341M',
  serial: 'L42687590',
  mode: 'direct',
  status: 'online',
  host: '192.168.1.64:80',
  firmware: 'V5.7.8 build 240108',
  lastSeenMinutes: 1,
  eventsToday: 142,
  pushEnabled: true,
  settings: { authMode: 'face', distance: 3, threshold: 90, timeoutSec: 10, capacity: 3000, volume: 7, brightness: 60, doorOpenSec: 5, reminder: true },
  recent: [
    { name: 'Aziza Karimova', minutesAgo: 2, direction: 'in' },
    { name: 'Sardor Alimov', minutesAgo: 7, direction: 'in' },
    { name: 'Malika Yusupova', minutesAgo: 13, direction: 'in' }
  ]
},
{
  id: 'dv-2',
  name: 'Chiqish · Asosiy eshik',
  branch: 'Markaziy ofis',
  kind: 'terminal',
  direction: 'out',
  model: 'DS-K1T341M',
  serial: 'G53911207',
  mode: 'direct',
  status: 'online',
  host: '192.168.1.65:80',
  firmware: 'V5.7.8 build 240108',
  lastSeenMinutes: 2,
  eventsToday: 136,
  pushEnabled: true,
  settings: { authMode: 'face', distance: 3, threshold: 90, timeoutSec: 10, capacity: 3000, volume: 7, brightness: 60, doorOpenSec: 5, reminder: true },
  recent: [
    { name: 'Bekzod Nazarov', minutesAgo: 4, direction: 'out' },
    { name: 'Dilshod Rahimov', minutesAgo: 11, direction: 'out' },
    { name: 'Zilola Ismoilova', minutesAgo: 25, direction: 'out' }
  ]
},
{
  id: 'dv-3',
  name: 'Kirish · Turniket 1',
  branch: 'Markaziy ofis',
  kind: 'terminal',
  direction: 'in',
  model: 'DS-K1T321M',
  serial: 'G44120856',
  mode: 'direct',
  status: 'online',
  host: '192.168.1.66:80',
  firmware: 'V5.6.4 build 230815',
  lastSeenMinutes: 1,
  eventsToday: 98,
  pushEnabled: true,
  settings: { authMode: 'faceOrCard', distance: 2, threshold: 85, timeoutSec: 8, capacity: 1000, volume: 5, brightness: 50, doorOpenSec: 3, reminder: false },
  recent: [{ name: 'Jasur Toshpo\'latov', minutesAgo: 6, direction: 'in' }]
},
{
  id: 'dv-4',
  name: 'Kirish · Turniket 2',
  branch: 'Markaziy ofis',
  kind: 'terminal',
  direction: 'in',
  model: 'DS-K1T321M',
  serial: 'G44120857',
  mode: 'direct',
  status: 'online',
  host: '192.168.1.67:80',
  firmware: 'V5.6.4 build 230815',
  lastSeenMinutes: 4,
  eventsToday: 91,
  pushEnabled: true,
  settings: { authMode: 'faceOrCard', distance: 2, threshold: 85, timeoutSec: 8, capacity: 1000, volume: 4, brightness: 50, doorOpenSec: 3, reminder: false },
  recent: [{ name: 'Malika Yusupova', minutesAgo: 9, direction: 'in' }]
},
{
  id: 'dv-5',
  name: 'Qabulxona · Kamera 2',
  branch: 'Chilonzor filiali',
  kind: 'doorbell',
  direction: 'both',
  model: 'DS-K1T671M',
  serial: 'F22056312',
  mode: 'direct',
  status: 'online',
  host: '10.12.4.21:80',
  firmware: 'V5.5.2 build 230420',
  lastSeenMinutes: 3,
  eventsToday: 44,
  pushEnabled: true,
  settings: { authMode: 'face', distance: 1, threshold: 80, timeoutSec: 5, capacity: 50, volume: 8, brightness: 40, reminder: true }
},
{
  id: 'dv-6',
  name: 'Lobbi · Kamera 4',
  branch: 'Chilonzor filiali',
  kind: 'camera',
  direction: 'both',
  model: 'DS-2CD2685F',
  serial: 'F09812445',
  mode: 'direct',
  status: 'offline',
  host: '10.12.4.34:8001',
  firmware: 'V5.4.0 build 220714',
  lastSeenMinutes: 310,
  eventsToday: 0,
  pushEnabled: false,
  settings: { authMode: 'face', distance: 5, threshold: 75, timeoutSec: 15, capacity: 6000, volume: 0, brightness: 55, doorOpenSec: 10 },
  recent: []
},
{
  id: 'dv-7',
  name: 'Kirish · Asosiy eshik',
  branch: 'Samarqand markaziy filiali',
  kind: 'terminal',
  direction: 'in',
  model: 'DS-K1T341M',
  serial: 'H61004772',
  mode: 'isup',
  status: 'pending',
  firmware: '—',
  lastSeenMinutes: null,
  eventsToday: 0,
  pushEnabled: false,
  settings: { authMode: 'face', distance: 3, threshold: 90, timeoutSec: 10, capacity: 3000, volume: 5, brightness: 50, doorOpenSec: 5, reminder: true }
},
{
  id: 'dv-8',
  name: 'Chiqish · Turniket 1',
  branch: 'Farg\'ona filiali',
  kind: 'terminal',
  direction: 'out',
  model: 'DS-K1T341M',
  serial: 'G77120384',
  mode: 'isup',
  status: 'error',
  firmware: 'V5.7.8 build 240108',
  lastSeenMinutes: 186,
  eventsToday: 12,
  pushEnabled: false,
  settings: { authMode: 'face', distance: 3, threshold: 92, timeoutSec: 10, capacity: 3000, volume: 6, brightness: 60, doorOpenSec: 5, reminder: false },
  recent: [{ name: 'Dilshod Rahimov', minutesAgo: 190, direction: 'out' }]
}];

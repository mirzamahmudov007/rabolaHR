import { employees } from '@/shared/data/employees';
import type { FaceLog } from '@/features/monitoring/types/faceLog';

const photo = (id: string) => employees.find((e) => e.id === id)?.photo ?? '';

const STRANGER_1 = "/cbf4d700-2072-4c72-aed8-cd57f3fdbecb.jpg";
const STRANGER_2 = "/9a267e3d-36cf-47a6-8538-2cf67bf199e2.jpg";
const STRANGER_3 = "/e33c5846-d63e-4d43-871e-57895c98fba8.jpg";

export const faceLogs: FaceLog[] = [
{ id: 'EV-1048', event: 'unknown', time: '14:37:18', camera: 'Lobbi · Kamera 4', branch: 'Markaziy ofis', similarity: 41.2, capture: STRANGER_1 },
{ id: 'EV-1047', event: 'in', employeeId: '1', time: '14:02:44', camera: 'Kirish · Turniket 1', branch: 'Chilonzor filiali', similarity: 98.1, capture: photo('1') },
{ id: 'EV-1046', event: 'in', employeeId: '7', time: '13:54:12', camera: 'Kirish · Turniket 2', branch: 'Sergeli filiali', similarity: 97.4, capture: photo('7') },
{ id: 'EV-1045', event: 'out', employeeId: '1', time: '13:05:31', camera: 'Chiqish · Turniket 1', branch: 'Chilonzor filiali', similarity: 97.9, capture: photo('1') },
{ id: 'EV-1044', event: 'unknown', time: '12:48:09', camera: 'Kirish · Turniket 2', branch: 'Sergeli filiali', similarity: 38.6, capture: STRANGER_2 },
{ id: 'EV-1043', event: 'out', employeeId: '4', time: '12:31:47', camera: 'Chiqish · Asosiy eshik', branch: 'Markaziy ofis', similarity: 96.2, capture: photo('4') },
{ id: 'EV-1049', event: 'out', employeeId: '7', time: '11:46:22', camera: 'Chiqish · Turniket 2', branch: 'Sergeli filiali', similarity: 84.3, capture: photo('7') },
{ id: 'EV-1042', event: 'in', employeeId: '6', time: '10:11:03', camera: 'Kirish · Turniket 1', branch: 'Yunusobod filiali', similarity: 95.8, capture: photo('6') },
{ id: 'EV-1041', event: 'in', employeeId: '2', time: '09:24:36', camera: 'Kirish · Turniket 1', branch: 'Chilonzor filiali', similarity: 98.6, capture: photo('2') },
{ id: 'EV-1040', event: 'unknown', time: '09:12:51', camera: 'Qabulxona · Kamera 2', branch: 'Markaziy ofis', similarity: 52.3, capture: STRANGER_3 },
{ id: 'EV-1039', event: 'in', employeeId: '1', time: '08:52:20', camera: 'Kirish · Turniket 1', branch: 'Chilonzor filiali', similarity: 98.4, capture: photo('1') },
{ id: 'EV-1038', event: 'in', employeeId: '3', time: '08:27:14', camera: 'Kirish · Asosiy eshik', branch: 'Markaziy ofis', similarity: 97.1, capture: photo('3') },
{ id: 'EV-1037', event: 'in', employeeId: '10', time: '07:58:02', camera: 'Kirish · Asosiy eshik', branch: 'Markaziy ofis', similarity: 96.7, capture: photo('10') },
{ id: 'EV-1036', event: 'in', employeeId: '4', time: '07:56:48', camera: 'Kirish · Asosiy eshik', branch: 'Markaziy ofis', similarity: 97.8, capture: photo('4') }];


/** Events replayed by the live simulation. */
export const liveTemplates: Omit<FaceLog, 'id' | 'time'>[] = [
{ event: 'in', employeeId: '4', camera: 'Kirish · Asosiy eshik', branch: 'Markaziy ofis', similarity: 96.9, capture: photo('4') },
{ event: 'out', employeeId: '2', camera: 'Chiqish · Turniket 1', branch: 'Chilonzor filiali', similarity: 98.2, capture: photo('2') },
{ event: 'unknown', camera: 'Kirish · Turniket 2', branch: 'Sergeli filiali', similarity: 44.7, capture: STRANGER_2 },
{ event: 'out', employeeId: '6', camera: 'Chiqish · Turniket 1', branch: 'Yunusobod filiali', similarity: 95.1, capture: photo('6') },
{ event: 'in', employeeId: '3', camera: 'Kirish · Asosiy eshik', branch: 'Markaziy ofis', similarity: 97.6, capture: photo('3') }];
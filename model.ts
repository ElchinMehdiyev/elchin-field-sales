import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

// ---- Types ----
export type Note = {
  id: string;
  text: string;
  createdAt: Date;
  updatedAt?: Date;
};

export type VisitStatus = 'Not planned' | 'Planned' | 'In progress' | 'Done';

export type Visit = {
  id: string;
  outletName: string;
  address: string;
  status: VisitStatus;
  plannedAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
  notes: Note[];
};

// ---- Fake data ----
export const OUTLETS: Visit[] = [
  { id: '1', outletName: 'Pub Pod Zegarem', address: 'ul. Floriańska 12, Kraków', status: 'Not planned', notes: [] },
  { id: '2', outletName: 'Sklep Mała Żabka', address: 'ul. Długa 45, Kraków', status: 'Not planned', notes: [] },
  { id: '3', outletName: 'Restauracja Wawel View', address: 'ul. Grodzka 8, Kraków', status: 'Not planned', notes: [] },
  { id: '4', outletName: 'Bar Kazimierz', address: 'ul. Szeroka 3, Kraków', status: 'Not planned', notes: [] },
];

// ---- Colours used everywhere ----
export const COLORS = {
  green: '#0B6E3B',
  red: '#C0392B',
  grey: '#B8C7BE',
  background: '#F2F4F3',
  muted: '#777',
};

// ---- Helpers ----
const pad = (n: number) => String(n).padStart(2, '0');

export function formatTime(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDate(d: Date) {
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export function durationInMinutes(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / 60000);
}

export function statusText(v: Visit) {
  if (v.status === 'In progress' && v.startedAt) {
    return `In progress · started ${formatTime(v.startedAt)}`;
  }
  if (v.status === 'Done' && v.startedAt && v.endedAt) {
    return `Done · ${formatTime(v.startedAt)}–${formatTime(v.endedAt)} · ${durationInMinutes(v.startedAt, v.endedAt)} min`;
  }
  if (v.status === 'Planned') return 'Planned';
  return 'Not planned yet';
}

// Simple unique id for new notes
export function newId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 6);
}

// Opens the date picker, then the time picker, then gives back the combined result
export function pickDateTime(initial: Date | undefined, onPicked: (date: Date) => void) {
  const start = initial ?? new Date();
  DateTimePickerAndroid.open({
    value: start,
    mode: 'date',
    minimumDate: new Date(),
    onChange: (event, pickedDate) => {
      if (event.type !== 'set' || !pickedDate) return;
      DateTimePickerAndroid.open({
        value: start,
        mode: 'time',
        is24Hour: true,
        onChange: (event2, pickedTime) => {
          if (event2.type !== 'set' || !pickedTime) return;
          const result = new Date(pickedDate);
          result.setHours(pickedTime.getHours(), pickedTime.getMinutes(), 0, 0);
          onPicked(result);
        },
      });
    },
  });
}
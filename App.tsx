import { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'; // NEW

// ---- Data model ----
type Visit = {
  id: string;
  outletName: string;
  address: string;
  status: 'Not planned' | 'Planned' | 'In progress' | 'Done'; // NEW: "Not planned"
  plannedAt?: Date; // NEW: the date + time the rep chose
  startedAt?: Date;
  endedAt?: Date;
};

const OUTLETS: Visit[] = [
  { id: '1', outletName: 'Pub Pod Zegarem', address: 'ul. Floriańska 12, Kraków', status: 'Not planned' },
  { id: '2', outletName: 'Sklep Mała Żabka', address: 'ul. Długa 45, Kraków', status: 'Not planned' },
  { id: '3', outletName: 'Restauracja Wawel View', address: 'ul. Grodzka 8, Kraków', status: 'Not planned' },
  { id: '4', outletName: 'Bar Kazimierz', address: 'ul. Szeroka 3, Kraków', status: 'Not planned' },
];

// ---- Helpers ----
const pad = (n: number) => String(n).padStart(2, '0');

function formatTime(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// NEW: date as 04.10.2026
function formatDate(d: Date) {
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function durationInMinutes(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / 60000);
}

// ---- The screen ----
export default function App() {
  const [visits, setVisits] = useState<Visit[]>(OUTLETS);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const visitInProgress = visits.some(v => v.status === 'In progress');
  const plannedCount = visits.filter(v => v.status !== 'Not planned').length;

  // NEW: sort — planned visits by date/time first, unplanned at the bottom
  const sortedVisits = [...visits].sort((a, b) => {
    if (!a.plannedAt) return 1;
    if (!b.plannedAt) return -1;
    return a.plannedAt.getTime() - b.plannedAt.getTime();
  });

  // NEW: open date picker, then time picker, then save the result
  function planVisit(id: string) {
    const current = visits.find(v => v.id === id);
    const initial = current?.plannedAt ?? new Date();

    DateTimePickerAndroid.open({
      value: initial,
      mode: 'date',
      minimumDate: new Date(), // cannot plan in the past
      onChange: (event, pickedDate) => {
        if (event.type !== 'set' || !pickedDate) return; // rep pressed Cancel

        DateTimePickerAndroid.open({
          value: initial,
          mode: 'time',
          is24Hour: true,
          onChange: (event2, pickedTime) => {
            if (event2.type !== 'set' || !pickedTime) return;

            // combine chosen date + chosen time into one Date
            const plannedAt = new Date(pickedDate);
            plannedAt.setHours(pickedTime.getHours(), pickedTime.getMinutes(), 0, 0);

            setVisits(list =>
              list.map(v => (v.id === id ? { ...v, status: 'Planned', plannedAt } : v))
            );
          },
        });
      },
    });
  }

  function startVisit(id: string) {
    setVisits(list =>
      list.map(v => (v.id === id ? { ...v, status: 'In progress', startedAt: new Date() } : v))
    );
  }

  function endVisit(id: string) {
    setVisits(list =>
      list.map(v => (v.id === id ? { ...v, status: 'Done', endedAt: new Date() } : v))
    );
  }

  function statusText(v: Visit) {
    if (v.status === 'In progress' && v.startedAt) {
      return `In progress · started ${formatTime(v.startedAt)}`;
    }
    if (v.status === 'Done' && v.startedAt && v.endedAt) {
      return `Done · ${formatTime(v.startedAt)}–${formatTime(v.endedAt)} · ${durationInMinutes(v.startedAt, v.endedAt)} min`;
    }
    if (v.status === 'Planned') return 'Planned';
    return 'Not planned yet';
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.company}>Elchin CO LTD · Field Sales</Text>
        <Text style={styles.greeting}>Good morning, Marek</Text>
        <Text style={styles.date}>
          {today} · {plannedCount} of {visits.length} outlets planned
        </Text>
      </View>

      <FlatList
        data={sortedVisits}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={[styles.card, item.status === 'In progress' && styles.cardActive]}>
            <View style={{ flex: 1 }}>
              {item.plannedAt && (
                <Text style={styles.time}>
                  {formatDate(item.plannedAt)} · {formatTime(item.plannedAt)}
                </Text>
              )}
              <Text style={styles.outlet}>{item.outletName}</Text>
              <Text style={styles.address}>{item.address}</Text>
              <Text style={styles.status}>{statusText(item)}</Text>
            </View>

            {/* NEW: not planned → "Visit outlet" opens the pickers */}
            {item.status === 'Not planned' && (
              <TouchableOpacity style={styles.button} onPress={() => planVisit(item.id)}>
                <Text style={styles.buttonText}>Visit outlet</Text>
              </TouchableOpacity>
            )}

            {/* Planned → Start visit + Change link */}
            {item.status === 'Planned' && (
              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity
                  style={[styles.button, visitInProgress && styles.buttonDisabled]}
                  disabled={visitInProgress}
                  onPress={() => startVisit(item.id)}
                >
                  <Text style={styles.buttonText}>Start visit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => planVisit(item.id)}>
                  <Text style={styles.link}>Change</Text>
                </TouchableOpacity>
              </View>
            )}

            {item.status === 'In progress' && (
              <TouchableOpacity style={[styles.button, styles.buttonEnd]} onPress={() => endVisit(item.id)}>
                <Text style={styles.buttonText}>End visit</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// ---- Styling ----
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F3' },
  header: { backgroundColor: '#0B6E3B', padding: 20, paddingTop: 48 },
  company: { color: '#BFE5CF', fontSize: 13, fontWeight: '600' },
  greeting: { color: 'white', fontSize: 24, fontWeight: '700', marginTop: 4 },
  date: { color: '#DDF2E5', fontSize: 14, marginTop: 4 },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardActive: { borderWidth: 2, borderColor: '#0B6E3B' },
  time: { color: '#0B6E3B', fontWeight: '700', fontSize: 14 },
  outlet: { fontSize: 17, fontWeight: '600', marginTop: 2 },
  address: { color: '#666', fontSize: 13, marginTop: 2 },
  status: { color: '#777', fontSize: 12, marginTop: 6 },
  button: { backgroundColor: '#0B6E3B', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  buttonDisabled: { backgroundColor: '#B8C7BE' },
  buttonEnd: { backgroundColor: '#C0392B' },
  buttonText: { color: 'white', fontWeight: '600' },
  link: { color: '#0B6E3B', fontSize: 13, marginTop: 8, textDecorationLine: 'underline' },
});
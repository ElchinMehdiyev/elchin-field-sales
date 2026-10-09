import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Visit, COLORS, formatDate, formatTime, statusText } from '../model';

type Props = {
  visits: Visit[];
  onOpen: (id: string) => void;
  onPlan: (id: string) => void;
  onStart: (id: string) => void;
  onEnd: (id: string) => void;
};

export default function OutletListScreen({ visits, onOpen, onPlan, onStart, onEnd }: Props) {
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const visitInProgress = visits.some(v => v.status === 'In progress');
  const plannedCount = visits.filter(v => v.status !== 'Not planned').length;

  // planned visits first (by date/time), unplanned at the bottom
  const sorted = [...visits].sort((a, b) => {
    if (!a.plannedAt) return 1;
    if (!b.plannedAt) return -1;
    return a.plannedAt.getTime() - b.plannedAt.getTime();
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.company}>Elchin CO LTD · Field Sales</Text>
        <Text style={styles.greeting}>Good morning, Marek</Text>
        <Text style={styles.date}>{today} · {plannedCount} of {visits.length} outlets planned</Text>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          // The whole card is tappable and opens the outlet screen
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onOpen(item.id)}
            style={[styles.card, item.status === 'In progress' && styles.cardActive]}
          >
            <View style={{ flex: 1 }}>
              {item.plannedAt && (
                <Text style={styles.time}>{formatDate(item.plannedAt)} · {formatTime(item.plannedAt)}</Text>
              )}
              <Text style={styles.outlet}>{item.outletName}</Text>
              <Text style={styles.address}>{item.address}</Text>
              <Text style={styles.status}>{statusText(item)}</Text>
              {item.notes.length > 0 && (
                <View style={styles.notesRow}>
                  <Ionicons name="document-text-outline" size={14} color={COLORS.muted} />
                  <Text style={styles.notesText}>
                    {item.notes.length} {item.notes.length === 1 ? 'note' : 'notes'}
                  </Text>
                </View>
              )}
            </View>

            {item.status === 'Not planned' && (
              <TouchableOpacity style={styles.button} onPress={() => onPlan(item.id)}>
                <Text style={styles.buttonText}>Visit outlet</Text>
              </TouchableOpacity>
            )}

            {item.status === 'Planned' && (
              <TouchableOpacity
                style={[styles.button, visitInProgress && styles.buttonDisabled]}
                disabled={visitInProgress}
                onPress={() => onStart(item.id)}
              >
                <Text style={styles.buttonText}>Start visit</Text>
              </TouchableOpacity>
            )}

            {item.status === 'In progress' && (
              <TouchableOpacity style={[styles.button, styles.buttonEnd]} onPress={() => onEnd(item.id)}>
                <Text style={styles.buttonText}>End visit</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.green, padding: 20, paddingTop: 48 },
  company: { color: '#BFE5CF', fontSize: 13, fontWeight: '600' },
  greeting: { color: 'white', fontSize: 24, fontWeight: '700', marginTop: 4 },
  date: { color: '#DDF2E5', fontSize: 14, marginTop: 4 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  cardActive: { borderWidth: 2, borderColor: COLORS.green },
  time: { color: COLORS.green, fontWeight: '700', fontSize: 14 },
  outlet: { fontSize: 17, fontWeight: '600', marginTop: 2 },
  address: { color: '#666', fontSize: 13, marginTop: 2 },
  status: { color: COLORS.muted, fontSize: 12, marginTop: 6 },
  notesRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  notesText: { color: COLORS.muted, fontSize: 12 },
  button: { backgroundColor: COLORS.green, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  buttonDisabled: { backgroundColor: COLORS.grey },
  buttonEnd: { backgroundColor: COLORS.red },
  buttonText: { color: 'white', fontWeight: '600' },
});
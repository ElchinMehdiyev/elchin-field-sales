import { useState } from 'react';
import {
  SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, Alert, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Visit, COLORS, formatDate, formatTime, statusText } from '../model';

type Props = {
  visit: Visit;
  visitInProgress: boolean;
  onBack: () => void;
  onPlan: () => void;
  onStart: () => void;
  onEnd: () => void;
  onAddNote: (text: string) => void;
  onEditNote: (noteId: string, text: string) => void;
  onDeleteNote: (noteId: string) => void;
};

export default function OutletDetailScreen(props: Props) {
  const { visit, visitInProgress, onBack, onPlan, onStart, onEnd, onAddNote, onEditNote, onDeleteNote } = props;

  const [newNote, setNewNote] = useState('');                    // text in the "new note" box
  const [editingId, setEditingId] = useState<string | null>(null); // which note is being edited
  const [editText, setEditText] = useState('');                  // text while editing

  // Opens Google Maps with directions to the outlet address
  function openRoute() {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(visit.address)}`;
    Linking.openURL(url);
  }

  function addNote() {
    const text = newNote.trim();
    if (!text) return;
    onAddNote(text);
    setNewNote('');
  }

  function startEditing(noteId: string, text: string) {
    setEditingId(noteId);
    setEditText(text);
  }

  function saveEdit() {
    if (editingId && editText.trim()) onEditNote(editingId, editText.trim());
    setEditingId(null);
  }

  function confirmDelete(noteId: string) {
    Alert.alert('Delete note?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDeleteNote(noteId) },
    ]);
  }

  const canPlan = visit.status === 'Not planned' || visit.status === 'Planned';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with back button, outlet info and Route button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backRow}>
          <Ionicons name="arrow-back" size={22} color="white" />
          <Text style={styles.backText}>Outlets</Text>
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{visit.outletName}</Text>
            <Text style={styles.address}>{visit.address}</Text>
          </View>
          
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        {/* ---- Visit section ---- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit</Text>
          <Text style={styles.planned}>
            {visit.plannedAt
              ? `${formatDate(visit.plannedAt)} · ${formatTime(visit.plannedAt)}`
              : 'No date and time set'}
          </Text>
          <Text style={styles.status}>{statusText(visit)}</Text>

          <View style={styles.row}>
            {canPlan && (
              <TouchableOpacity style={styles.buttonOutline} onPress={onPlan}>
                <Text style={styles.buttonOutlineText}>
                  {visit.plannedAt ? 'Change date & time' : 'Set date & time'}
                </Text>
              </TouchableOpacity>
            )}
                        <TouchableOpacity style={[styles.buttonOutline, styles.routeInline]} onPress={openRoute}>
              <Ionicons name="navigate" size={18} color={COLORS.green} />
              <Text style={styles.buttonOutlineText}>Route</Text>
            </TouchableOpacity>

            {visit.status === 'Planned' && (
              <TouchableOpacity
                style={[styles.button, visitInProgress && styles.buttonDisabled]}
                disabled={visitInProgress}
                onPress={onStart}
              >
                <Text style={styles.buttonText}>Start visit</Text>
              </TouchableOpacity>
            )}

            {visit.status === 'In progress' && (
              <TouchableOpacity style={[styles.button, styles.buttonEnd]} onPress={onEnd}>
                <Text style={styles.buttonText}>End visit</Text>
              </TouchableOpacity>
            )}
          </View>

          {visit.status === 'Planned' && visitInProgress && (
            <Text style={styles.hint}>Finish your current visit before starting this one.</Text>
          )}
        </View>

        {/* ---- Notes section ---- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes ({visit.notes.length})</Text>

          <TextInput
            style={styles.input}
            placeholder="Write a note…"
            value={newNote}
            onChangeText={setNewNote}
            multiline
          />
          <TouchableOpacity
            style={[styles.button, styles.addButton, !newNote.trim() && styles.buttonDisabled]}
            disabled={!newNote.trim()}
            onPress={addNote}
          >
            <Text style={styles.buttonText}>Add note</Text>
          </TouchableOpacity>

          {/* newest notes first */}
          {[...visit.notes].reverse().map(note => (
            <View key={note.id} style={styles.note}>
              {editingId === note.id ? (
                <>
                  <TextInput style={styles.input} value={editText} onChangeText={setEditText} multiline autoFocus />
                  <View style={styles.row}>
                    <TouchableOpacity style={styles.button} onPress={saveEdit}>
                      <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonOutline} onPress={() => setEditingId(null)}>
                      <Text style={styles.buttonOutlineText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.noteText}>{note.text}</Text>
                  <View style={styles.noteFooter}>
                    <Text style={styles.noteDate}>
                      {formatDate(note.createdAt)} {formatTime(note.createdAt)}
                      {note.updatedAt ? ' · edited' : ''}
                    </Text>
                    <View style={styles.iconRow}>
                      <TouchableOpacity onPress={() => startEditing(note.id, note.text)} style={styles.iconButton}>
                        <Ionicons name="create-outline" size={20} color={COLORS.green} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => confirmDelete(note.id)} style={styles.iconButton}>
                        <Ionicons name="trash-outline" size={20} color={COLORS.red} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.green, padding: 20, paddingTop: 48 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  backText: { color: 'white', fontSize: 15 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { color: 'white', fontSize: 22, fontWeight: '700' },
  address: { color: '#DDF2E5', fontSize: 14, marginTop: 4 },
  routeButton: { backgroundColor: 'white', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center' },
  routeText: { color: COLORS.green, fontSize: 12, fontWeight: '600', marginTop: 2 },
  section: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  planned: { fontSize: 15, color: COLORS.green, fontWeight: '600' },
  status: { color: COLORS.muted, fontSize: 13, marginTop: 4 },
  hint: { color: COLORS.muted, fontSize: 12, marginTop: 8 },
  row: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  button: { backgroundColor: COLORS.green, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { backgroundColor: COLORS.grey },
  buttonEnd: { backgroundColor: COLORS.red },
  buttonText: { color: 'white', fontWeight: '600' },
  buttonOutline: { borderWidth: 1, borderColor: COLORS.green, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  buttonOutlineText: { color: COLORS.green, fontWeight: '600' },
routeInline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addButton: { marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10, minHeight: 60, textAlignVertical: 'top', fontSize: 15 },
  note: { borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 12, marginTop: 12 },
  noteText: { fontSize: 15 },
  noteFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  noteDate: { color: COLORS.muted, fontSize: 12 },
  iconRow: { flexDirection: 'row', gap: 4 },
  iconButton: { padding: 4 },
});
import { useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { Visit, OUTLETS, pickDateTime, newId } from './model';
import OutletListScreen from './screens/OutletListScreen';
import OutletDetailScreen from './screens/OutletDetailScreen';

export default function App() {
  const [visits, setVisits] = useState<Visit[]>(OUTLETS);
  const [selectedId, setSelectedId] = useState<string | null>(null); // which outlet is open (null = list)

  // Android back button: from the outlet screen, go back to the list
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedId) {
        setSelectedId(null);
        return true; // we handled it
      }
      return false; // let Android close the app
    });
    return () => sub.remove();
  }, [selectedId]);

  // Small helper: change one visit, keep the others as they are
  function updateVisit(id: string, change: (v: Visit) => Visit) {
    setVisits(list => list.map(v => (v.id === id ? change(v) : v)));
  }

  function planVisit(id: string) {
    const current = visits.find(v => v.id === id);
    pickDateTime(current?.plannedAt, plannedAt =>
      updateVisit(id, v => ({ ...v, plannedAt, status: v.status === 'Not planned' ? 'Planned' : v.status }))
    );
  }

  function startVisit(id: string) {
    updateVisit(id, v => ({ ...v, status: 'In progress', startedAt: new Date() }));
  }

  function endVisit(id: string) {
    updateVisit(id, v => ({ ...v, status: 'Done', endedAt: new Date() }));
  }

  function addNote(id: string, text: string) {
    updateVisit(id, v => ({ ...v, notes: [...v.notes, { id: newId(), text, createdAt: new Date() }] }));
  }

  function editNote(id: string, noteId: string, text: string) {
    updateVisit(id, v => ({
      ...v,
      notes: v.notes.map(n => (n.id === noteId ? { ...n, text, updatedAt: new Date() } : n)),
    }));
  }

  function deleteNote(id: string, noteId: string) {
    updateVisit(id, v => ({ ...v, notes: v.notes.filter(n => n.id !== noteId) }));
  }

  const visitInProgress = visits.some(v => v.status === 'In progress');
  const selected = visits.find(v => v.id === selectedId);

  // If an outlet is selected, show its screen; otherwise show the list
  if (selected) {
    return (
      <OutletDetailScreen
        visit={selected}
        visitInProgress={visitInProgress}
        onBack={() => setSelectedId(null)}
        onPlan={() => planVisit(selected.id)}
        onStart={() => startVisit(selected.id)}
        onEnd={() => endVisit(selected.id)}
        onAddNote={text => addNote(selected.id, text)}
        onEditNote={(noteId, text) => editNote(selected.id, noteId, text)}
        onDeleteNote={noteId => deleteNote(selected.id, noteId)}
      />
    );
  }

  return (
    <OutletListScreen
      visits={visits}
      onOpen={setSelectedId}
      onPlan={planVisit}
      onStart={startVisit}
      onEnd={endVisit}
    />
  );
}
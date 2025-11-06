import { createStore } from 'solid-js/store';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  color?: string;
}

interface NotesState {
  notes: Note[];
  loading: boolean;
  error: string;
  selectedNoteId: string | null;
  searchQuery: string;
  filterTags: string[];
}

const [notesStore, setNotesStore] = createStore<NotesState>({
  notes: [],
  loading: false,
  error: '',
  selectedNoteId: null,
  searchQuery: '',
  filterTags: [],
});

export const useNotesStore = () => {
  const setNotes = (notes: Note[]) => {
    setNotesStore('notes', notes);
  };

  const setLoading = (loading: boolean) => {
    setNotesStore('loading', loading);
  };

  const setError = (error: string) => {
    setNotesStore('error', error);
  };

  const addNote = (note: Note) => {
    setNotesStore('notes', (notes) => [note, ...notes]);
  };

  const updateNote = (id: string, updatedNote: Partial<Note>) => {
    setNotesStore('notes', (n) => n.id === id, {
      ...updatedNote,
      updatedAt: new Date(),
    });
  };

  const removeNote = (id: string) => {
    setNotesStore('notes', (notes) => notes.filter((n) => n.id !== id));
  };

  const togglePinNote = (id: string) => {
    const note = notesStore.notes.find((n) => n.id === id);
    if (note) {
      setNotesStore('notes', (n) => n.id === id, 'isPinned', !note.isPinned);
    }
  };

  const selectNote = (id: string | null) => {
    setNotesStore('selectedNoteId', id);
  };

  const setSearchQuery = (query: string) => {
    setNotesStore('searchQuery', query);
  };

  const setFilterTags = (tags: string[]) => {
    setNotesStore('filterTags', tags);
  };

  const addFilterTag = (tag: string) => {
    if (!notesStore.filterTags.includes(tag)) {
      setNotesStore('filterTags', [...notesStore.filterTags, tag]);
    }
  };

  const removeFilterTag = (tag: string) => {
    setNotesStore(
      'filterTags',
      notesStore.filterTags.filter((t) => t !== tag)
    );
  };

  const clearFilters = () => {
    setNotesStore('searchQuery', '');
    setNotesStore('filterTags', []);
  };

  const getNoteById = (id: string) => {
    return notesStore.notes.find((n) => n.id === id);
  };

  const getAllTags = () => {
    const tags = new Set<string>();
    notesStore.notes.forEach((note) => {
      note.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  };

  const reset = () => {
    setNotesStore({
      notes: [],
      loading: false,
      error: '',
      selectedNoteId: null,
      searchQuery: '',
      filterTags: [],
    });
  };

  return {
    store: notesStore,
    setNotes,
    setLoading,
    setError,
    addNote,
    updateNote,
    removeNote,
    togglePinNote,
    selectNote,
    setSearchQuery,
    setFilterTags,
    addFilterTag,
    removeFilterTag,
    clearFilters,
    getNoteById,
    getAllTags,
    reset,
  };
};

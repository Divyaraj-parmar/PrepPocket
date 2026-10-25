import { useEffect, useState, useMemo } from 'react';
import TabToggle from './components/TabToggle';
import SearchBar from './components/SearchBar';
import NoteRow from './components/NoteRow';
import QuestionRow from './components/QuestionRow';
import NewItemModal from './components/NewItemModal';
import NotesWorkspace from './components/NotesWorkspace';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import { storage } from './utils/storage';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api/v1/notes`
  : 'http://localhost:4001/api/v1/notes';

// By default, frontend-only deployment operates in client-side interactive demo mode.
// Backend calls are only enabled if explicitly toggled via VITE_USE_BACKEND=true.
const IS_BACKEND_ENABLED = import.meta.env.VITE_USE_BACKEND === 'true';

function App() {
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'questions'
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState(() => (IS_BACKEND_ENABLED ? [] : storage.getNotes()));
  const [questions, setQuestions] = useState(() => (IS_BACKEND_ENABLED ? [] : storage.getQuestions()));
  const [isLoading, setIsLoading] = useState(IS_BACKEND_ENABLED);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotesPageOpen, setIsNotesPageOpen] = useState(false);
  const [isNotesPageReadOnly, setIsNotesPageReadOnly] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [notification, setNotification] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // PWA install prompt and online/offline event listeners
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Auto-trigger mobile install bottom pop-up if not dismissed in session
      const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setShowInstallPopup(true);
      }
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setShowInstallPopup(false);
    }
  };

  const handleDismissInstallPopup = () => {
    setShowInstallPopup(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  // Auto-dismiss notifications after 4 seconds
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  // If backend is explicitly enabled, fetch initial records asynchronously
  useEffect(() => {
    if (!IS_BACKEND_ENABLED) return;

    let isMounted = true;
    fetch(`${API_BASE}/getAllNotes`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned status ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!isMounted) return;
        const allItems = json.data || [];
        setNotes(allItems.filter((item) => item.type === 'N'));
        setQuestions(allItems.filter((item) => item.type === 'Q'));
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Backend unavailable, falling back to local demo storage:', err);
        setNotes(storage.getNotes());
        setQuestions(storage.getQuestions());
        setNotification({
          type: 'info',
          message: 'Loaded in interactive demo mode using browser LocalStorage.'
        });
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter notes/questions based on search query
  const filteredNotes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return notes;
    return notes.filter((note) => {
      return (
        (note.title && note.title.toLowerCase().includes(query)) ||
        (note.content && note.content.toLowerCase().includes(query)) ||
        (note.link && note.link.toLowerCase().includes(query)) ||
        (note.tags && note.tags.some((tag) => tag.toLowerCase().includes(query)))
      );
    });
  }, [notes, searchQuery]);

  const filteredQuestions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return questions;
    return questions.filter((q) => {
      const qTitle = q.title || q.question || '';
      return (
        qTitle.toLowerCase().includes(query) ||
        (q.content && q.content.toLowerCase().includes(query)) ||
        (q.link && q.link.toLowerCase().includes(query)) ||
        (q.tags && q.tags.some((tag) => tag.toLowerCase().includes(query)))
      );
    });
  }, [questions, searchQuery]);

  // Create or Update Item Handler
  const handleSaveItem = async (formData) => {
    const itemType = activeTab === 'notes' ? 'N' : 'Q';
    const payload = {
      ...formData,
      type: itemType
    };

    let savedItem;

    if (IS_BACKEND_ENABLED) {
      if (editingItem) {
        // Update existing item in backend
        const res = await fetch(`${API_BASE}/updatenote/${editingItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.message || 'Failed to update item');
        }

        const { data: updatedItem } = await res.json();
        savedItem = updatedItem;
        if (itemType === 'N') {
          setNotes((prev) => prev.map((n) => (n._id === updatedItem._id ? updatedItem : n)));
        } else {
          setQuestions((prev) => prev.map((q) => (q._id === updatedItem._id ? updatedItem : q)));
        }
      } else {
        // Create new item in backend
        const res = await fetch(`${API_BASE}/createNote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.message || 'Failed to create item');
        }

        const { data: createdItem } = await res.json();
        savedItem = createdItem;
        if (itemType === 'N') {
          setNotes((prev) => [createdItem, ...prev]);
        } else {
          setQuestions((prev) => [createdItem, ...prev]);
        }
      }
    } else {
      // Client-side LocalStorage execution
      if (editingItem) {
        const updatedItem = {
          ...editingItem,
          ...payload,
          updatedAt: new Date().toISOString()
        };
        savedItem = updatedItem;

        if (itemType === 'N') {
          const next = notes.map((n) => (n._id === editingItem._id ? updatedItem : n));
          setNotes(next);
          storage.saveNotes(next);
        } else {
          const next = questions.map((q) => (q._id === editingItem._id ? updatedItem : q));
          setQuestions(next);
          storage.saveQuestions(next);
        }
      } else {
        const newItem = {
          _id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          ...payload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        savedItem = newItem;

        if (itemType === 'N') {
          const next = [newItem, ...notes];
          setNotes(next);
          storage.saveNotes(next);
        } else {
          const next = [newItem, ...questions];
          setQuestions(next);
          storage.saveQuestions(next);
        }
      }
    }

    setNotification({
      type: 'success',
      message: `${itemType === 'N' ? 'Note' : 'Question'} ${editingItem ? 'updated' : 'added'} successfully!`
    });
    return savedItem;
  };

  // Delete prompt & execution handlers
  const handlePromptDelete = (item, type) => {
    setItemToDelete({ ...item, type });
  };

  const handleConfirmDelete = async (item) => {
    setIsDeleting(true);
    try {
      if (IS_BACKEND_ENABLED) {
        const res = await fetch(`${API_BASE}/deletenote/${item._id}`, {
          method: 'DELETE'
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.message || 'Failed to delete');
        }
      }

      // Update state and localStorage
      if (item.type === 'N') {
        const next = notes.filter((n) => n._id !== item._id);
        setNotes(next);
        if (!IS_BACKEND_ENABLED) storage.saveNotes(next);
      } else {
        const next = questions.filter((q) => q._id !== item._id);
        setQuestions(next);
        if (!IS_BACKEND_ENABLED) storage.saveQuestions(next);
      }

      setNotification({
        type: 'success',
        message: `${item.type === 'Q' ? 'Question' : 'Note'} deleted successfully!`
      });
      setItemToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to delete item.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset demo data to default sample items
  const handleResetDemoData = () => {
    const { notes: freshNotes, questions: freshQuestions } = storage.resetToDefault();
    setNotes(freshNotes);
    setQuestions(freshQuestions);
    setNotification({
      type: 'success',
      message: 'Restored sample DSA notes and questions to default demo data.'
    });
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsNotesPageReadOnly(false);
    if (activeTab === 'notes') {
      setIsNotesPageOpen(true);
      return;
    }
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleOpenNoteEdit = (item) => {
    setIsNotesPageReadOnly(false);
    setActiveTab('notes');
    setEditingItem(item);
    setIsNotesPageOpen(true);
  };

  const handleOpenNoteView = (item) => {
    setActiveTab('notes');
    setEditingItem(item);
    setIsNotesPageReadOnly(true);
    setIsNotesPageOpen(true);
  };

  const resultsCount = activeTab === 'notes' ? filteredNotes.length : filteredQuestions.length;
  const searchPlaceholder =
    activeTab === 'notes'
      ? 'Search notes by title, tag, or domain...'
      : 'Search solved questions by name, tag, or platform...';

  if (isNotesPageOpen) {
    return (
      <NotesWorkspace
        key={`${editingItem?._id || 'new-note'}-${isNotesPageReadOnly ? 'view' : 'edit'}`}
        notes={notes}
        itemToEdit={editingItem}
        readOnly={isNotesPageReadOnly}
        onOpenNote={setEditingItem}
        onNewNote={() => { setIsNotesPageReadOnly(false); setEditingItem(null); }}
        onEdit={() => setIsNotesPageReadOnly(false)}
        onClose={() => { setIsNotesPageOpen(false); setIsNotesPageReadOnly(false); setEditingItem(null); }}
        onSave={async (formData) => {
          const saved = await handleSaveItem(formData);
          if (saved) setEditingItem(saved);
          return saved;
        }}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Top Header Section */}
      <header className="app-header">
        <div className="brand-section">
          <img src="/favicon-32x32.png" alt="PrepPocket" className="brand-logo-img" />
          <span className="brand-title">PrepPocket</span>
          {!IS_BACKEND_ENABLED && (
            <span
              className="demo-badge"
              title="Interactive client-side demo mode. Your edits and additions are saved locally to your browser."
            >
              Interactive Demo
            </span>
          )}
        </div>

        {/* Top Middle Segmented Control */}
        <TabToggle activeTab={activeTab} setActiveTab={setActiveTab} />
      </header>

      {/* Offline Status Banner */}
      {isOffline && (
        <div className="status-banner offline">
          <span>⚡ You are currently offline — viewing cached PrepPocket notes.</span>
        </div>
      )}

      {/* Status Banner */}
      {notification && (
        <div className={`status-banner ${notification.type}`}>
          <span>{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem', color: 'inherit' }}
            aria-label="Dismiss notification"
          >
            &times;
          </button>
        </div>
      )}

      {/* Centered Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder={searchPlaceholder}
        resultsCount={resultsCount}
      />

      {/* Actions and Content Header */}
      <div className="content-actions-bar">
        <div className="section-info">
          <h2>My {activeTab === 'notes' ? 'Notes' : 'Questions'}</h2>
          <div className="section-meta-row">
            <p>
              {isLoading
                ? 'Loading items...'
                : `Reviewing ${resultsCount} ${activeTab === 'notes' ? 'notes' : 'questions'}`}
            </p>
            {!IS_BACKEND_ENABLED && (
              <button
                type="button"
                className="btn-reset-demo"
                onClick={handleResetDemoData}
                title="Reset sample notes and questions back to original demo state"
              >
                Reset Sample Data
              </button>
            )}
          </div>
        </div>
        <button
          type="button"
          className="btn-primary-add"
          onClick={handleOpenAdd}
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>{activeTab === 'notes' ? 'Add Note' : 'Add Question'}</span>
        </button>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading items...</p>
        </div>
      ) : resultsCount > 0 ? (
        <div className="rows-list">
          {activeTab === 'notes'
            ? filteredNotes.map((note) => (
                <NoteRow
        key={`${editingItem?._id || 'new-note'}-${isNotesPageReadOnly ? 'view' : 'edit'}`}
                  {...note}
                  onView={() => handleOpenNoteView(note)}
                  onEdit={() => handleOpenNoteEdit(note)}
                  onDelete={() => handlePromptDelete(note, 'N')}
                />
              ))
            : filteredQuestions.map((q) => (
                <QuestionRow
        key={`${editingItem?._id || 'new-note'}-${isNotesPageReadOnly ? 'view' : 'edit'}`}
                  {...q}
                  onEdit={() => handleOpenEdit(q)}
                  onDelete={() => handlePromptDelete(q, 'Q')}
                />
              ))}
        </div>
      ) : (
        <div className="empty-state">
          <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3>No items found</h3>
          <p>
            {searchQuery
              ? `No matching results found for "${searchQuery}".`
              : `Your ${activeTab} list is currently empty. Use the button above to add a new link!`}
          </p>
          {!IS_BACKEND_ENABLED && (
            <button
              type="button"
              className="btn-reset-demo"
              onClick={handleResetDemoData}
              style={{ marginTop: '0.75rem', padding: '4px 12px', fontSize: '0.8rem' }}
            >
              Restore Sample Items
            </button>
          )}
        </div>
      )}

      {/* Add / Edit Item Modal */}
      <NewItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        activeTab={activeTab}
        onSubmit={handleSaveItem}
        itemToEdit={editingItem}
      />

      {/* Theme-based Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(itemToDelete)}
        item={itemToDelete}
        onClose={() => !isDeleting && setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Mobile Floating PWA Install Pop-up */}
      {showInstallPopup && installPrompt && (
        <div className="pwa-install-popup-overlay">
          <div className="pwa-install-popup-card" role="dialog" aria-modal="true">
            <div className="pwa-popup-header">
              <div className="pwa-popup-info">
                <img src="/pwa-192x192.png" alt="PrepPocket" className="pwa-popup-icon" />
                <div className="pwa-popup-text">
                  <h3>Install PrepPocket</h3>
                  <p>Add to your home screen for fast, 1-tap offline revision.</p>
                </div>
              </div>
              <button
                type="button"
                className="pwa-popup-close-btn"
                onClick={handleDismissInstallPopup}
                aria-label="Dismiss"
              >
                &times;
              </button>
            </div>
            <div className="pwa-popup-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleDismissInstallPopup}
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              >
                Not Now
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleInstallClick}
                style={{
                  padding: '6px 16px',
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Install</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

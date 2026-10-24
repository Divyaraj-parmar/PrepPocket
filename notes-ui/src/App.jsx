import { useEffect, useState, useMemo } from 'react';
import TabToggle from './components/TabToggle';
import SearchBar from './components/SearchBar';
import NoteRow from './components/NoteRow';
import QuestionRow from './components/QuestionRow';
import NewItemModal from './components/NewItemModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import './App.css';

const API_BASE = 'http://localhost:4001/api/v1/notes';

function App() {
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'questions'
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [notification, setNotification] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-dismiss notifications after 4 seconds
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  // Fetch initial notes and questions from backend
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/getAllNotes`);
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const json = await res.json();
      const allItems = json.data || [];
      
      setNotes(allItems.filter((item) => item.type === 'N'));
      setQuestions(allItems.filter((item) => item.type === 'Q'));
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setNotification({
        type: 'error',
        message: 'Could not connect to the backend server. Make sure it is running on port 4001.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

    if (editingItem) {
      // Update existing item
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

      if (itemType === 'N') {
        setNotes((prev) => prev.map((n) => (n._id === updatedItem._id ? updatedItem : n)));
      } else {
        setQuestions((prev) => prev.map((q) => (q._id === updatedItem._id ? updatedItem : q)));
      }

      setNotification({
        type: 'success',
        message: `${itemType === 'N' ? 'Note' : 'Question'} updated successfully!`
      });
    } else {
      // Create new item
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

      if (itemType === 'N') {
        setNotes((prev) => [createdItem, ...prev]);
      } else {
        setQuestions((prev) => [createdItem, ...prev]);
      }

      setNotification({
        type: 'success',
        message: `${itemType === 'N' ? 'Note' : 'Question'} added successfully!`
      });
    }
  };

  // Delete prompt & execution handlers
  const handlePromptDelete = (item, type) => {
    setItemToDelete({ ...item, type });
  };

  const handleConfirmDelete = async (item) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/deletenote/${item._id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to delete');
      }

      if (item.type === 'N') {
        setNotes((prev) => prev.filter((n) => n._id !== item._id));
      } else {
        setQuestions((prev) => prev.filter((q) => q._id !== item._id));
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

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const resultsCount = activeTab === 'notes' ? filteredNotes.length : filteredQuestions.length;
  const searchPlaceholder =
    activeTab === 'notes'
      ? 'Search notes by title, tag, or domain...'
      : 'Search solved questions by name, tag, or platform...';

  return (
    <div className="app-container">
      {/* Top Header Section */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <span className="brand-title">PrepPocket</span>
        </div>

        {/* Top Middle Segmented Control */}
        <TabToggle activeTab={activeTab} setActiveTab={setActiveTab} />
      </header>

      {/* Status Banner */}
      {notification && (
        <div className={`status-banner ${notification.type}`}>
          <span>{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem', color: 'inherit' }}
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
          <p>
            {isLoading
              ? 'Loading items...'
              : `Reviewing ${resultsCount} ${activeTab === 'notes' ? 'notes' : 'questions'}`}
          </p>
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
          <p>Connecting to database...</p>
        </div>
      ) : resultsCount > 0 ? (
        <div className="rows-list">
          {activeTab === 'notes'
            ? filteredNotes.map((note) => (
                <NoteRow
                  key={note._id}
                  {...note}
                  onEdit={() => handleOpenEdit(note)}
                  onDelete={() => handlePromptDelete(note, 'N')}
                />
              ))
            : filteredQuestions.map((q) => (
                <QuestionRow
                  key={q._id}
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
    </div>
  );
}

export default App;

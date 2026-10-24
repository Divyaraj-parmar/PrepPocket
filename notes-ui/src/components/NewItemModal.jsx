import { useState } from 'react';

function ModalFormContent({ activeTab, onSubmit, itemToEdit, onClose }) {
  const [title, setTitle] = useState(itemToEdit?.title || itemToEdit?.question || '');
  const [link, setLink] = useState(itemToEdit?.link || '');
  const [content, setContent] = useState(itemToEdit?.content || '');
  const [tags, setTags] = useState(itemToEdit?.tags ? itemToEdit.tags.join(', ') : '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(itemToEdit);
  const isNotes = activeTab === 'notes';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!link.trim()) {
      setError('Link / URL is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit({
        title: title.trim(),
        link: link.trim(),
        content: content.trim(),
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      });
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>
          {isEditing 
            ? (isNotes ? 'Edit Learning Note' : 'Edit Practice Question')
            : (isNotes ? 'Add Learning Note' : 'Add Practice Question')}
        </h2>
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          &times;
        </button>
      </div>

      {error && (
        <div
          className="modal-error-banner"
          style={{
            background: '#fee2e2',
            color: '#b91c1c',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '0.82rem',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title-input">
            {isNotes ? 'Note Title' : 'Question Name'} <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="title-input"
            type="text"
            required
            placeholder={isNotes ? 'e.g. CSS Flexbox & Grid Guide' : 'e.g. Two Sum'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="link-input">
            {isNotes ? 'Article / Resource URL' : 'Problem URL'} <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="link-input"
            type="text"
            required
            placeholder={isNotes ? 'https://medium.com/... or https://youtube.com/...' : 'https://leetcode.com/problems/...'}
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="content-input">
            {isNotes ? 'Summary / Key Takeaways' : 'Solution Strategy / Hints'}
          </label>
          <textarea
            id="content-input"
            rows={3}
            placeholder={
              isNotes
                ? 'Key takeaways, commands, or concepts to remember...'
                : 'Time & space complexity, corner cases, data structures used...'
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags-input">Tags (comma-separated)</label>
          <input
            id="tags-input"
            type="text"
            placeholder={isNotes ? 'e.g. css, layout, frontend' : 'e.g. hashmap, array, easy'}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : (isNotes ? 'Add Note' : 'Add Question')}
          </button>
        </div>
      </form>
    </div>
  );
}

function NewItemModal({ isOpen, onClose, activeTab, onSubmit, itemToEdit }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <ModalFormContent
        key={itemToEdit ? itemToEdit._id : 'new_item'}
        activeTab={activeTab}
        onSubmit={onSubmit}
        itemToEdit={itemToEdit}
        onClose={onClose}
      />
    </div>
  );
}

export default NewItemModal;

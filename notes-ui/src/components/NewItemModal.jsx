import { useState, useEffect } from 'react';

function NewItemModal({ isOpen, onClose, activeTab, onSubmit, itemToEdit }) {
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title || itemToEdit.question || '');
      setLink(itemToEdit.link || '');
      setContent(itemToEdit.content || '');
      setTags(itemToEdit.tags ? itemToEdit.tags.join(', ') : '');
    } else {
      setTitle('');
      setLink('');
      setContent('');
      setTags('');
    }
    setError('');
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

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
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = Boolean(itemToEdit);
  const isNotes = activeTab === 'notes';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {isEditing 
              ? (isNotes ? 'Edit Learning Note' : 'Edit Practice Question')
              : (isNotes ? 'Add Learning Note' : 'Add Practice Question')}
          </h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {error && (
          <div className="modal-error-banner" style={{
            background: '#fee2e2',
            color: '#b91c1c',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '0.82rem',
            marginBottom: '1rem'
          }}>
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
    </div>
  );
}

export default NewItemModal;

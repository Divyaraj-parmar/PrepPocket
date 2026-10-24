import { useEffect } from 'react';

function ConfirmDeleteModal({ isOpen, item, onClose, onConfirm, isDeleting }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !item) return null;

  const itemTitle = item.title || item.question || 'this item';
  const itemTypeLabel = item.type === 'Q' ? 'question' : 'note';

  return (
    <div className="modal-overlay" onClick={() => !isDeleting && onClose()}>
      <div 
        className="modal-content confirm-delete-modal" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
      >
        <div className="confirm-delete-icon-wrapper">
          <div className="confirm-delete-icon-badge">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
              />
            </svg>
          </div>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose} 
            disabled={isDeleting}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <div className="confirm-delete-body">
          <h2 id="confirm-delete-title" className="confirm-delete-title">
            Delete {itemTypeLabel === 'question' ? 'Question' : 'Note'}?
          </h2>
          <p className="confirm-delete-message">
            Are you sure you want to delete <span className="delete-target-title">"{itemTitle}"</span>? This action cannot be undone.
          </p>

          {item.link && (
            <div className="confirm-delete-preview">
              <span className="confirm-preview-label">Resource:</span>
              <span className="confirm-preview-link">{item.link}</span>
            </div>
          )}
        </div>

        <div className="modal-footer confirm-delete-footer">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onClose} 
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn-danger" 
            onClick={() => onConfirm(item)} 
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="delete-btn-spinner" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;

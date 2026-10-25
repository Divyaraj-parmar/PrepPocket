function NoteRow({ title, link, content, tags, createdAt, date, onView, onEdit, onDelete }) {
  const getDisplayLinkTitle = (url) => {
    if (!url) return '';
    try {
      const parsed = new URL(url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`);
      let host = parsed.hostname.replace('www.', '');
      if (host.includes('baeldung.com')) return 'Baeldung';
      if (host.includes('geeksforgeeks.org')) return 'GeeksforGeeks';
      if (host.includes('youtube.com') || host.includes('youtu.be')) return 'YouTube';
      if (host.includes('github.com')) return 'GitHub';
      if (host.includes('medium.com')) return 'Medium';
      if (host.includes('oracle.com')) return 'Oracle Docs';
      if (host.includes('dev.to')) return 'Dev.to';
      if (host.includes('stackoverflow.com')) return 'StackOverflow';
      return host.charAt(0).toUpperCase() + host.slice(1);
    } catch {
      return 'Link';
    }
  };

  const formattedLink = link?.trim() ? (link.trim().startsWith('http') ? link.trim() : `https://${link.trim()}`) : null;
  const displayDate = date || (createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '');

  return (
    <div className="list-row note-row">
      <div className="row-content-left">
        <div className="row-title-container">
          {formattedLink ? (
            <a 
              href={formattedLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="row-title-link"
              title="Open Revision Link"
            >
              <span className="row-title">{title}</span>
              <svg className="row-link-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ) : (
            <span className="row-title">{title}</span>
          )}
          {content && <p className="row-content-text" title={content}>{content}</p>}
        </div>
        
        {tags && tags.length > 0 && (
          <div className="row-tags">
            {tags.map((tag, idx) => (
              <span key={idx} className="row-tag">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="row-actions-right">
        {displayDate && <span className="row-date">{displayDate}</span>}
        {formattedLink && (
          <a
            href={formattedLink}
            target="_blank"
            rel="noopener noreferrer"
            className="row-action-link-btn"
            title={`Go to ${getDisplayLinkTitle(link)}`}
          >
            <span>{getDisplayLinkTitle(link)}</span>
            <svg className="row-action-link-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
        {onView && (
          <button type="button" className="row-view-btn" onClick={onView} title="View Note" aria-label={`View ${title}`}>
            <svg className="view-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.25 12s3.5-7 9.75-7 9.75 7 9.75 7-3.5 7-9.75 7-9.75-7-9.75-7z" />
              <circle cx="12" cy="12" r="3" strokeWidth="2" />
            </svg>
          </button>
        )}        {onEdit && (
          <button
            type="button"
            className="row-edit-btn"
            onClick={onEdit}
            title="Edit Note"
          >
            <svg className="edit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className="row-delete-btn"
            onClick={onDelete}
            title="Delete Note"
          >
            <svg className="delete-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default NoteRow;

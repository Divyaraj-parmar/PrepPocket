function QuestionRow({ title, question, link, content, tags, createdAt, date, onEdit, onDelete }) {
  const displayTitle = title || question;

  const getDisplayLinkTitle = (url) => {
    if (!url) return 'Notes';
    try {
      const parsed = new URL(url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`);
      let host = parsed.hostname.replace('www.', '');
      if (host.includes('leetcode.com')) return 'LeetCode';
      if (host.includes('geeksforgeeks.org')) return 'GeeksforGeeks';
      if (host.includes('hackerrank.com')) return 'HackerRank';
      if (host.includes('codeforces.com')) return 'Codeforces';
      if (host.includes('interviewbit.com')) return 'InterviewBit';
      return host.charAt(0).toUpperCase() + host.slice(1);
    } catch {
      return 'Practice';
    }
  };

  const formattedLink = link?.trim() ? (link.trim().startsWith('http') ? link.trim() : `https://${link.trim()}`) : null;
  const platform = getDisplayLinkTitle(link || '');
  const displayDate = date || (createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '');

  // Branded styling for common coding platforms
  const getPlatformBadgeClass = (plat) => {
    const p = plat.toLowerCase();
    if (p.includes('leetcode')) return 'badge-leetcode';
    if (p.includes('geeksforgeeks')) return 'badge-gfg';
    if (p.includes('hackerrank')) return 'badge-hackerrank';
    return 'badge-other';
  };

  return (
    <div className="list-row question-row">
      <div className="row-content-left">
        <div className="row-title-container">
          {formattedLink ? (
            <a
              href={formattedLink}
              target="_blank"
              rel="noopener noreferrer"
              className="row-title-link"
              title="Open Practice Problem"
            >
              <span className="row-title">{displayTitle}</span>
              <svg className="row-link-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ) : (
            <span className="row-title">{displayTitle}</span>
          )}
          {content && <p className="row-content-text" title={content}>{content}</p>}
        </div>

        {((link && platform) || (tags && tags.length > 0)) && (
          <div className="row-tags">
            {link && (
              <span className={`row-platform-badge ${getPlatformBadgeClass(platform)}`}>
                {platform}
              </span>
            )}
            {tags && tags.map((tag, idx) => (
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
            className="row-action-link-btn practice-btn"
            title={`Solve on ${platform}`}
          >
            <span>Solve</span>
            <svg className="row-action-link-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
        {onEdit && (
          <button
            type="button"
            className="row-edit-btn"
            onClick={onEdit}
            title="Edit Question"
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
            title="Delete Question"
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

export default QuestionRow;

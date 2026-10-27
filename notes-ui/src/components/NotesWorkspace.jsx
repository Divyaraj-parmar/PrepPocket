import { useEffect, useMemo, useRef, useState } from 'react';
import NotesMarkdownPreview from './NotesMarkdownPreview';

const formatTools = [
  { label: 'Bold', marker: '**', shortcut: 'B' },
  { label: 'Italic', marker: '*', shortcut: 'I' },
  { label: 'Strikethrough', marker: '~~', shortcut: null },
];

function formatSelection(textarea, before, after = before) {
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const selected = value.slice(start, end);
  const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
  const selectionStart = start + before.length;
  const selectionEnd = selected ? selectionStart + selected.length : selectionStart;
  return { value: next, selectionStart, selectionEnd };
}

function prefixLines(textarea, prefix) {
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const lineEndIndex = value.indexOf('\n', end);
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
  const lines = value.slice(lineStart, lineEnd).split('\n');
  const nextLines = lines.map((line) => `${prefix}${line}`);
  const replacement = nextLines.join('\n');
  const cursor = start === end ? start + prefix.length : lineStart + replacement.length;
  return {
    value: `${value.slice(0, lineStart)}${replacement}${value.slice(lineEnd)}`,
    selectionStart: cursor,
    selectionEnd: cursor,
  };
}

function insertCodeBlock(textarea) {
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const selected = value.slice(start, end);
  const before = start > 0 && value[start - 1] !== '\n' ? '\n' : '';
  const after = end < value.length && value[end] !== '\n' ? '\n' : '';
  const block = `\`\`\`\n${selected}\n\`\`\``;
  const cursor = start + before.length + 4;

  return {
    value: `${value.slice(0, start)}${before}${block}${after}${value.slice(end)}`,
    selectionStart: cursor,
    selectionEnd: selected ? cursor + selected.length : cursor,
  };
}

function NotesWorkspace({ notes, itemToEdit, readOnly, onOpenNote, onNewNote, onEdit, onClose, onSave }) {
  const [title, setTitle] = useState(itemToEdit?.title || '');
  const [content, setContent] = useState(itemToEdit?.content || '');
  const [link, setLink] = useState(itemToEdit?.link || '');
  const [tags, setTags] = useState(itemToEdit?.tags?.join(', ') || '');
  const [search, setSearch] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(Boolean(itemToEdit?.link || itemToEdit?.tags?.length));
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [historyAvailability, setHistoryAvailability] = useState({ canUndo: false, canRedo: false });
  const searchRef = useRef(null);
  const editorRef = useRef(null);
  const contentValueRef = useRef(itemToEdit?.content || '');
  const historyRef = useRef({ past: [], future: [], typingGroupOpen: false });
  const typingTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(typingTimerRef.current), []);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const visibleNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return notes;
    return notes.filter((note) =>
      [note.title, note.content, note.link, ...(note.tags || [])]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [notes, search]);

  const refreshHistoryAvailability = () => {
    setHistoryAvailability({
      canUndo: historyRef.current.past.length > 0,
      canRedo: historyRef.current.future.length > 0,
    });
  };

  const recordContentChange = (nextValue, isTyping = false) => {
    const currentValue = contentValueRef.current;
    if (nextValue === currentValue) return;
    const history = historyRef.current;
    clearTimeout(typingTimerRef.current);

    if (isTyping) {
      if (!history.typingGroupOpen) history.past.push(currentValue);
      history.typingGroupOpen = true;
      typingTimerRef.current = setTimeout(() => {
        historyRef.current.typingGroupOpen = false;
      }, 700);
    } else {
      history.typingGroupOpen = false;
      history.past.push(currentValue);
    }

    if (history.past.length > 100) history.past.shift();
    history.future = [];
    contentValueRef.current = nextValue;
    setContent(nextValue);
    setIsDirty(true);
    refreshHistoryAvailability();
  };

  const undoContent = () => {
    const history = historyRef.current;
    clearTimeout(typingTimerRef.current);
    history.typingGroupOpen = false;
    if (history.past.length === 0) return;
    history.future.push(contentValueRef.current);
    const previous = history.past.pop();
    contentValueRef.current = previous;
    setContent(previous);
    setIsDirty(true);
    refreshHistoryAvailability();
    requestAnimationFrame(() => editorRef.current?.focus());
  };

  const redoContent = () => {
    const history = historyRef.current;
    clearTimeout(typingTimerRef.current);
    history.typingGroupOpen = false;
    if (history.future.length === 0) return;
    history.past.push(contentValueRef.current);
    const next = history.future.pop();
    contentValueRef.current = next;
    setContent(next);
    setIsDirty(true);
    refreshHistoryAvailability();
    requestAnimationFrame(() => editorRef.current?.focus());
  };
  const updateText = (operation) => {
    if (readOnly || isPreview) return;
    const result = operation(editorRef.current);
    if (!result) return;
    recordContentChange(result.value);
    requestAnimationFrame(() => {
      editorRef.current?.focus();
      editorRef.current?.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  };

  const addLink = () => {
    if (readOnly || isPreview) return;
    const textarea = editorRef.current;
    if (!textarea) return;
    const selection = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd) || 'link text';
    const start = textarea.selectionStart;
    const selectedLength = textarea.selectionEnd - textarea.selectionStart || selection.length;
    const result = formatSelection(textarea, '[', '](https://)');
    recordContentChange(result.value);
    const urlStart = start + 1 + selectedLength + 2;
    requestAnimationFrame(() => {
      editorRef.current?.focus();
      editorRef.current?.setSelectionRange(urlStart, urlStart + 8);
    });
  };

  const handleEditorKeyDown = (event) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (key === 'z') {
      event.preventDefault();
      if (event.shiftKey) redoContent(); else undoContent();
      return;
    }
    if (key === 'y') {
      event.preventDefault();
      redoContent();
      return;
    }
    const tool = formatTools.find((item) => item.shortcut && item.shortcut.toLowerCase() === key);
    if (!tool) return;
    event.preventDefault();
    updateText((textarea) => formatSelection(textarea, tool.marker));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('Give your note a title before saving.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await onSave({
        title: title.trim(),
        link: link.trim(),
        content: content.trim(),
        tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      });
      setIsDirty(false);
    } catch (saveError) {
      setError(saveError.message || 'Could not save this note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectNote = (note) => {
    if (isDirty && !window.confirm('You have unsaved changes. Discard them and open another note?')) return;
    setMobileNavOpen(false);
    onOpenNote(note);
  };

  const startNewNote = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Discard them and start a new note?')) return;
    setTitle('');
    setContent('');
    contentValueRef.current = '';
    historyRef.current = { past: [], future: [], typingGroupOpen: false };
    setHistoryAvailability({ canUndo: false, canRedo: false });
    clearTimeout(typingTimerRef.current);
    setLink('');
    setTags('');
    setIsDirty(false);
    setError('');
    setShowDetails(false);
    setIsPreview(false);
    setMobileNavOpen(false);
    onNewNote();
  };

  const closeWorkspace = () => {
    if (isDirty && !window.confirm('Discard your unsaved changes and leave this note?')) return;
    onClose();
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <main className="notes-workspace-screen">
      {mobileNavOpen && <button type="button" className="notes-mobile-scrim" onClick={() => setMobileNavOpen(false)} aria-label="Close notes list" />}
      <aside className={`notes-workspace-sidebar${mobileNavOpen ? ' mobile-open' : ''}`}>
        <div className="notes-sidebar-brand">
          <img src="/favicon-32x32.png" alt="" />
          <div><strong>PrepPocket</strong><span>Notes workspace</span></div>
        </div>
        <button type="button" className="notes-back-button" onClick={closeWorkspace}>
          <span aria-hidden="true">←</span> Back to PrepPocket
        </button>
        <div className="notes-sidebar-heading">
          <div><span className="notes-sidebar-kicker">YOUR LIBRARY</span><h2>All Notes <span>{notes.length}</span></h2></div>
          <button type="button" className="notes-new-icon-button" onClick={startNewNote} aria-label="Create a new note" title="New note">＋</button>
        </div>
        <label className="notes-sidebar-search">
          <span aria-hidden="true">⌕</span>
          <input ref={searchRef} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a note" aria-label="Find a note" />
          <kbd>Ctrl K</kbd>
        </label>
        <div className="notes-sidebar-list">
          {visibleNotes.map((note) => (
            <button
              type="button"
              key={note._id}
              className={`notes-sidebar-item${itemToEdit?._id === note._id ? ' selected' : ''}`}
              onClick={() => selectNote(note)}
            >
              <span className="notes-sidebar-item-title">{note.title || 'Untitled note'}</span>
              <span className="notes-sidebar-item-preview">{note.content?.replace(/[#*_`[\]]/g, '').trim() || 'No additional text'}</span>
              <span className="notes-sidebar-item-date">{note.updatedAt ? new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}</span>
            </button>
          ))}
          {visibleNotes.length === 0 && <p className="notes-list-empty">{search ? 'No notes match your search.' : 'Your notes will appear here.'}</p>}
        </div>
        <div className="notes-sidebar-footer">{notes.length} {notes.length === 1 ? 'note' : 'notes'} in your library</div>
      </aside>

      <section className="notes-editor-area">
        <header className="notes-editor-topbar">
          <div className="notes-topbar-left">
            <button type="button" className="notes-mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Open notes list">☰</button>
            <div className="notes-breadcrumb"><span>Notes</span><span aria-hidden="true">/</span><strong>{title.trim() || 'New note'}</strong></div>
          </div>
          <div className="notes-editor-top-actions">
            <span className={`notes-save-state${isDirty ? ' unsaved' : ''}`}>
              <i />{readOnly ? 'Viewing note' : isDirty ? 'Unsaved changes' : 'All changes saved'}
            </span>
            {readOnly && <button type="button" className="notes-view-edit-button" onClick={onEdit}>Edit note</button>}
            <button type="button" className="notes-close-button" onClick={closeWorkspace}>Done</button>
          </div>
        </header>

        <form className="notes-editor-form" onSubmit={handleSave}>
          <div className="notes-editor-document">
            <div className="notes-document-meta">
              <span className="notes-document-type"><span>✎</span> {readOnly ? 'NOTE VIEW' : 'PERSONAL NOTE'}</span>
              {itemToEdit?.updatedAt && <span>Edited {new Date(itemToEdit.updatedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>}
            </div>
            {readOnly ? (
              <h1 className="notes-title-input notes-title-display">{title || 'Untitled note'}</h1>
            ) : (
              <input
                className="notes-title-input"
                value={title}
                onChange={(event) => { setTitle(event.target.value); setIsDirty(true); }}
                placeholder="Untitled note"
                aria-label="Note title"
                maxLength={160}
                autoFocus={!readOnly}
              />
            )}
            {!readOnly && (
            <div className="notes-editor-toolbar" role="toolbar" aria-label="Note formatting">
              <button type="button" title="Undo (Ctrl+Z)" aria-label="Undo" disabled={!historyAvailability.canUndo || isPreview} onClick={undoContent}>↶</button>
              <button type="button" title="Redo (Ctrl+Y)" aria-label="Redo" disabled={!historyAvailability.canRedo || isPreview} onClick={redoContent}>↷</button>
              <span className="notes-toolbar-divider" />
              {formatTools.map((tool) => (
                <button key={tool.label} type="button" title={tool.shortcut ? `${tool.label} (Ctrl+${tool.shortcut})` : tool.label} aria-label={tool.label} disabled={isPreview} onClick={() => updateText((textarea) => formatSelection(textarea, tool.marker))}>
                  <strong>{tool.label === 'Bold' ? 'B' : tool.label === 'Italic' ? 'I' : 'S'}</strong>
                </button>
              ))}
              <span className="notes-toolbar-divider" />
              <button type="button" title="Heading" aria-label="Heading" disabled={isPreview} onClick={() => updateText((textarea) => prefixLines(textarea, '## '))}>H</button>
              <button type="button" title="Bulleted list" aria-label="Bulleted list" disabled={isPreview} onClick={() => updateText((textarea) => prefixLines(textarea, '- '))}>☷</button>
              <button type="button" title="Numbered list" aria-label="Numbered list" disabled={isPreview} onClick={() => updateText((textarea) => prefixLines(textarea, '1. '))}>1.</button>
              <button type="button" title="Checklist" aria-label="Checklist" disabled={isPreview} onClick={() => updateText((textarea) => prefixLines(textarea, '- [ ] '))}>☑</button>
              <button type="button" title="Quote" aria-label="Quote" disabled={isPreview} onClick={() => updateText((textarea) => prefixLines(textarea, '> '))}>❞</button>
              <button type="button" title="Code block" aria-label="Code block" disabled={isPreview} onClick={() => updateText(insertCodeBlock)}>{'<>'}</button>
              <button type="button" title="Insert link" aria-label="Insert link" disabled={isPreview} onClick={addLink}>↗</button>
              <button type="button" className={`notes-preview-toggle${isPreview ? ' active' : ''}`} aria-pressed={isPreview} onClick={() => setIsPreview((preview) => !preview)}>{isPreview ? 'Write' : 'Preview'}</button>
              <span className="notes-toolbar-spacer" />
              <button type="button" className="notes-details-toggle" onClick={() => setShowDetails((shown) => !shown)} aria-expanded={showDetails}>Details <span>{showDetails ? '⌃' : '⌄'}</span></button>
            </div>
            )}
            {readOnly || isPreview ? (
              <NotesMarkdownPreview content={content} />
            ) : (
              <textarea
                ref={editorRef}
                className="notes-writing-canvas"
                value={content}
                onChange={(event) => recordContentChange(event.target.value, true)}
                onKeyDown={handleEditorKeyDown}
                placeholder="Start writing… Capture an idea, a useful explanation, or the things you want to remember."
                aria-label="Note content"
                spellCheck="true"
              />
            )}
            {showDetails && (
              <div className="notes-detail-fields">
                <label className="notes-detail-field">
                  <span>RESOURCE LINK <small>OPTIONAL</small></span>
                  {readOnly ? (link ? <a href={link} target="_blank" rel="noopener noreferrer">{link}</a> : <em>None added</em>) : <input type="url" value={link} onChange={(event) => { setLink(event.target.value); setIsDirty(true); }} placeholder="Paste an article, video, or reference URL" />}
                </label>
                <label className="notes-detail-field">
                  <span>TAGS <small>SEPARATE WITH COMMAS</small></span>
                  {readOnly ? <span>{tags || 'None added'}</span> : <input value={tags} onChange={(event) => { setTags(event.target.value); setIsDirty(true); }} placeholder="e.g. algorithms, interview prep" />}
                </label>
              </div>
            )}
            {error && <p className="notes-editor-error" role="alert">{error}</p>}
          </div>
          <footer className="notes-editor-footer">
            <div className="notes-writing-stats"><span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span><span>·</span><span>{readingMinutes} min read</span><span>·</span><span>Markdown supported</span></div>
            {!readOnly && <div className="notes-footer-actions">
              <button type="button" className="notes-cancel-button" onClick={closeWorkspace}>Cancel</button>
              <button type="submit" className="notes-save-button" disabled={isSaving || !isDirty}>
                {isSaving ? 'Saving…' : itemToEdit ? 'Save changes' : 'Save note'}
              </button>
            </div>}
          </footer>
        </form>
      </section>
    </main>
  );
}

export default NotesWorkspace;

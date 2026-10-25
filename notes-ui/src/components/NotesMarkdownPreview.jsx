function renderInline(text, keyPrefix) {
  const tokens = text.split(/(\*\*.*?\*\*|~~.*?~~|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g);
  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`;
    const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    if (link) return <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer">{link[1]}</a>;
    if (token.startsWith('**') && token.endsWith('**')) return <strong key={key}>{token.slice(2, -2)}</strong>;
    if (token.startsWith('~~') && token.endsWith('~~')) return <del key={key}>{token.slice(2, -2)}</del>;
    if (token.startsWith('*') && token.endsWith('*')) return <em key={key}>{token.slice(1, -1)}</em>;
    if (token.startsWith('`') && token.endsWith('`')) return <code key={key}>{token.slice(1, -1)}</code>;
    return token;
  });
}

function NotesMarkdownPreview({ content }) {
  const blocks = [];
  const lines = content.split('\n');
  let codeLines = [];
  let inCode = false;

  lines.forEach((line, index) => {
    if (line.trim().startsWith('```')) {
      if (inCode) {
        blocks.push(<pre key={`code-${index}`}><code>{codeLines.join('\n')}</code></pre>);
        codeLines = [];
      }
      inCode = !inCode;
      return;
    }
    if (inCode) {
      codeLines.push(line);
      return;
    }
    if (!line.trim()) return;

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const task = line.match(/^\s*- \[([ xX])\]\s+(.+)$/);
    const bullet = line.match(/^\s*-\s+(.+)$/);
    const numbered = line.match(/^\s*\d+\.\s+(.+)$/);
    const quote = line.match(/^>\s?(.*)$/);
    const rendered = renderInline((heading || task || bullet || numbered || quote || [null, line])[heading ? 2 : 1], `line-${index}`);

    if (heading) {
      const Tag = `h${heading[1].length}`;
      blocks.push(<Tag key={`heading-${index}`}>{renderInline(heading[2], `heading-${index}`)}</Tag>);
    } else if (task) {
      blocks.push(<p key={`task-${index}`} className="notes-preview-task"><input type="checkbox" disabled defaultChecked={task[1].toLowerCase() === 'x'} />{renderInline(task[2], `task-${index}`)}</p>);
    } else if (bullet) {
      blocks.push(<p key={`bullet-${index}`} className="notes-preview-list-item">• {renderInline(bullet[1], `bullet-${index}`)}</p>);
    } else if (numbered) {
      blocks.push(<p key={`number-${index}`} className="notes-preview-list-item">{numbered[0].match(/^\s*(\d+)/)[1]}. {renderInline(numbered[1], `number-${index}`)}</p>);
    } else if (quote) {
      blocks.push(<blockquote key={`quote-${index}`}>{renderInline(quote[1], `quote-${index}`)}</blockquote>);
    } else {
      blocks.push(<p key={`paragraph-${index}`}>{rendered}</p>);
    }
  });

  if (inCode) blocks.push(<pre key="code-open"><code>{codeLines.join('\n')}</code></pre>);
  if (blocks.length === 0) blocks.push(<p key="empty" className="preview-empty">Nothing to preview yet.</p>);
  return <article className="notes-markdown-preview" aria-label="Formatted note preview">{blocks}</article>;
}

export default NotesMarkdownPreview;

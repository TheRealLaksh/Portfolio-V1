import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Icon from '../world/Icon';
import Card from './Cards';

const ALLOWED = ['p', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'br'];
const MD_COMPONENTS = {
  a: ({ href, children }) => (
    /^(https:\/\/|mailto:)/i.test(href || '')
      ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
      : <span>{children}</span>
  ),
};

export function Typing() {
  return (
    <li className="ask-m ask-m--bot" aria-label="AI Laksh is typing">
      <div className="ask-bubble ask-typing" aria-hidden="true"><i /><i /><i /></div>
    </li>
  );
}

export default function Message({ m, last, busy, onChip, onRate, onRetry }) {
  const [copied, setCopied] = useState(false);

  if (m.role === 'user') {
    return <li className="ask-m ask-m--you"><div className="ask-bubble">{m.text}</div></li>;
  }

  const copy = async () => {
    try { await navigator.clipboard.writeText(m.text); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* clipboard blocked */ }
  };

  return (
    <li className={`ask-m ask-m--bot${m.error ? ' is-error' : ''}`} data-id={m.id}>
      <div className="ask-bubble">
        {m.error ? <p>{m.text}</p> : (
          <div className="ask-md"><ReactMarkdown allowedElements={ALLOWED} unwrapDisallowed components={MD_COMPONENTS}>{m.text}</ReactMarkdown></div>
        )}
        {m.error && m.retry && (
          <button type="button" className="ask-retry" onClick={() => onRetry(m.retry)} disabled={busy}>
            <Icon n="refresh" size={14} />Try again
          </button>
        )}
      </div>

      {m.cards?.length > 0 && <div className="ask-cards">{m.cards.map((c) => <Card key={c.id || c.title} card={c} />)}</div>}

      {!m.error && (
        <div className="ask-tools">
          <button type="button" onClick={copy} aria-label={copied ? 'Reply copied' : 'Copy reply'}><Icon n={copied ? 'check' : 'copy'} size={14} /></button>
          <button type="button" onClick={() => onRate(m.id, 'up')} aria-pressed={m.rating === 'up'} aria-label="Good answer" disabled={!!m.rating}><Icon n="up" size={14} /></button>
          <button type="button" onClick={() => onRate(m.id, 'down')} aria-pressed={m.rating === 'down'} aria-label="Bad answer" disabled={!!m.rating}><Icon n="down" size={14} /></button>
          {m.rating && <span className="ask-thanks">Thanks, noted.</span>}
        </div>
      )}

      {last && !busy && m.chips?.length > 0 && (
        <div className="ask-chips" role="group" aria-label="Suggested questions">
          {m.chips.map((c) => <button type="button" key={c} onClick={() => onChip(c)}>{c}</button>)}
        </div>
      )}
    </li>
  );
}

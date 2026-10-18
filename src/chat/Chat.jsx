import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLenis } from '@studio-freight/react-lenis';
import Icon from '../world/Icon';
import Message, { Typing } from './Message';
import { useAsk } from './useAsk';
import { MAX_CHARS } from './api';
import './chat.css';

const STARTERS = [
  ['code', 'What has Laksh built?'],
  ['pay', 'How much does a website cost?'],
  ['cap', 'Where does he study?'],
  ['mail', 'How can I hire him?'],
];

const useMedia = (query) => {
  const [on, setOn] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const h = () => setOn(mq.matches);
    mq.addEventListener('change', h);
    h();
    return () => mq.removeEventListener('change', h);
  }, [query]);
  return on;
};

const typing = (el) => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);

export default function Chat() {
  const { messages, busy, send, reset, rate } = useAsk();
  const lenis = useLenis();
  const mobile = useMedia('(max-width: 640px)');
  const fine = useMedia('(pointer: fine)');
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [draft, setDraft] = useState('');

  const fab = useRef(null);
  const panel = useRef(null);
  const field = useRef(null);
  const list = useRef(null);

  const show = useCallback(() => { setClosing(false); setOpen(true); }, []);
  const hide = useCallback(() => {
    if (panel.current?.contains(document.activeElement)) fab.current?.focus({ preventScroll: true });
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setOpen(false); return; }
    setClosing(true);
    setTimeout(() => { setOpen(false); setClosing(false); }, 190);
  }, []);
  const toggle = useCallback(() => (open && !closing ? hide() : show()), [open, closing, hide, show]);

  // "/" opens the chat from anywhere on the page, Escape closes it.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) { hide(); return; }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !typing(e.target) && !open) { e.preventDefault(); show(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, hide, show]);

  // Anything else on the site can open it with window.dispatchEvent(new Event('toggle-chat')).
  useEffect(() => {
    window.addEventListener('toggle-chat', toggle);
    return () => window.removeEventListener('toggle-chat', toggle);
  }, [toggle]);

  // On a phone the chat is a full sheet: stop the page scrolling behind it (same approach as the Work popup).
  useEffect(() => {
    if (!open || !mobile) return undefined;
    const html = document.documentElement;
    html.style.setProperty('overflow-y', 'hidden', 'important');
    lenis?.stop();
    return () => { html.style.removeProperty('overflow-y'); lenis?.start(); };
  }, [open, mobile, lenis]);

  useEffect(() => {
    if (open && fine) {
      const t = setTimeout(() => field.current?.focus({ preventScroll: true }), 120);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open, fine]);

  // A new question goes to the bottom; a new answer starts at its top, so a long one is read from the start.
  const count = messages.length;
  useLayoutEffect(() => {
    const el = list.current;
    if (!el || !open) return;
    const last = messages[messages.length - 1];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = reduce ? 'auto' : 'smooth';
    if (last?.role === 'bot') {
      const node = el.querySelector(`[data-id="${last.id}"]`);
      if (node) { el.scrollTo({ top: Math.max(0, node.offsetTop - 12), behavior }); return; }
    }
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, [count, busy, open]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    const t = field.current;
    if (!t) return;
    t.style.height = 'auto';
    t.style.height = `${Math.min(t.scrollHeight, 112)}px`;
  }, [draft, open]);

  const submit = (e) => {
    e?.preventDefault();
    if (busy || !draft.trim()) return;
    const text = draft;
    setDraft('');
    send(text);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) submit(e);
  };

  const ask = (q) => { if (!busy) send(q); };
  const lastIdx = messages.length - 1;

  return (
    <div className="ask">
      {open && mobile && <div className="ask-scrim" onClick={hide} aria-hidden="true" />}

      {open && (
        <div
          ref={panel}
          className={`ask-panel${closing ? ' is-closing' : ''}`}
          role="dialog"
          aria-label="Chat with AI Laksh"
          aria-modal={mobile ? 'true' : undefined}
          data-lenis-prevent
        >
          <div className="ask-head">
            <span className="ask-avatar"><img src="/me.webp" alt="" width="40" height="40" /></span>
            <div className="ask-title">
              <h2>AI Laksh</h2>
              <p>Answers only from Laksh&rsquo;s real work</p>
            </div>
            {messages.length > 0 && (
              <button type="button" className="ask-ibtn" onClick={reset} aria-label="Start a new chat" title="New chat"><Icon n="refresh" size={18} /></button>
            )}
            <button type="button" className="ask-ibtn" onClick={hide} aria-label="Close chat"><Icon n="x" size={20} /></button>
          </div>

          <div className="ask-body" ref={list} role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation">
            {messages.length === 0 ? (
              <div className="ask-empty">
                <span className="ask-spark" aria-hidden="true"><Icon n="spark" size={22} /></span>
                <h3>Ask about Laksh&rsquo;s work</h3>
                <p>Projects, prices, background. I answer only from what is on this site, and I will say when I don&rsquo;t know.</p>
                <ul className="ask-starters">
                  {STARTERS.map(([ic, q]) => (
                    <li key={q}>
                      <button type="button" onClick={() => ask(q)} disabled={busy}>
                        <Icon n={ic} size={17} /><span>{q}</span><Icon n="arrow" size={15} className="go" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ol className="ask-list">
                {messages.map((m, i) => (
                  <Message key={m.id} m={m} last={i === lastIdx} busy={busy} onChip={ask} onRate={rate} onRetry={(t) => send(t, { retry: true })} />
                ))}
                {busy && <Typing />}
              </ol>
            )}
          </div>

          <form className="ask-form" onSubmit={submit}>
            <div className="ask-field">
              <textarea
                ref={field}
                rows={1}
                value={draft}
                maxLength={MAX_CHARS}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about projects, prices, background"
                aria-label="Your message"
                enterKeyHint="send"
                autoComplete="off"
              />
              <button type="submit" className="ask-send" disabled={busy || !draft.trim()} aria-label="Send message"><Icon n="plane" size={18} /></button>
            </div>
            <p className="ask-note">
              {draft.length > MAX_CHARS - 60
                ? <span className={draft.length >= MAX_CHARS ? 'warn' : ''}>{draft.length}/{MAX_CHARS}</span>
                : 'AI can be wrong. For anything important, message Laksh directly.'}
            </p>
          </form>
        </div>
      )}

      <button
        ref={fab}
        type="button"
        className={`ask-fab${open ? ' is-open' : ''}`}
        onClick={toggle}
        aria-label={open ? 'Close chat' : "Chat with Laksh's AI"}
        aria-expanded={open}
      >
        <span className="ask-fab-av">{open ? <Icon n="x" size={20} /> : <img src="/me.webp" alt="" width="44" height="44" />}</span>
        <span className="ask-fab-t">{open ? 'Close' : "Ask Laksh’s AI"}</span>
        {!open && <kbd aria-hidden="true">/</kbd>}
      </button>
    </div>
  );
}

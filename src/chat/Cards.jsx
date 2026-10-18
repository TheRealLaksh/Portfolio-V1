import React, { useState } from 'react';
import Icon from '../world/Icon';

// The server sends cards as data ({ type, title, ... }); this file only draws them.
// Links are checked again here, so a card can never carry a javascript: address.
const safeHref = (u) => (/^(https:\/\/|mailto:)/i.test(String(u)) ? u : '#');

const KIND_ICON = {
  whatsapp: 'chat', mail: 'mail', page: 'arrow', file: 'file',
  linkedin: 'linkedin', github: 'github', live: 'ext',
};

function Action({ a }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(a.copy); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* clipboard blocked */ }
  };
  const external = !String(a.url).startsWith('mailto:');
  return (
    <span className="ask-act-wrap">
      <a className="ask-act" href={safeHref(a.url)} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        <Icon n={KIND_ICON[a.kind] || 'arrow'} size={15} />
        <span>{a.label}</span>
      </a>
      {a.kind === 'mail' && a.copy && (
        <button type="button" className="ask-act ask-act--icon" onClick={copy} aria-label={copied ? 'Email copied' : `Copy ${a.copy}`}>
          <Icon n={copied ? 'check' : 'copy'} size={15} />
        </button>
      )}
    </span>
  );
}

const Actions = ({ list }) => (list?.length ? <div className="ask-acts">{list.map((a) => <Action key={a.label} a={a} />)}</div> : null);

const Head = ({ icon, title, status }) => (
  <div className="ask-card-head">
    <span className="ask-chip-ic" aria-hidden="true"><Icon n={icon} size={16} /></span>
    <h4>{title}</h4>
    {status && <span className="ask-status">{status}</span>}
  </div>
);

function Contact({ card }) {
  return (
    <>
      <Head icon="mail" title={card.title} />
      {card.note && <p className="ask-card-note">{card.note}</p>}
      <Actions list={card.actions} />
    </>
  );
}

function Pricing({ card }) {
  return (
    <>
      <Head icon="pay" title={card.title} />
      <ul className="ask-tiers">
        {card.tiers?.map((t) => (
          <li key={t.name}>
            <span className="ask-tier-top"><b>{t.name}</b><i>from {String(t.from).replace(/^from\s+/i, '')}</i></span>
            <span className="ask-tier-blurb">{t.blurb}</span>
          </li>
        ))}
      </ul>
      {card.note && <p className="ask-card-note">{card.note}</p>}
      <Actions list={card.actions} />
    </>
  );
}

function Project({ card }) {
  return (
    <>
      <Head icon="code" title={card.title} status={card.status} />
      {card.note && <p className="ask-card-note">{card.note}</p>}
      {card.tags?.length > 0 && <ul className="ask-tags">{card.tags.map((t) => <li key={t}>{t}</li>)}</ul>}
      <Actions list={card.actions} />
    </>
  );
}

function Links({ card }) {
  return (
    <>
      <Head icon="file" title={card.title} />
      <Actions list={card.actions} />
    </>
  );
}

const BY_TYPE = { contact: Contact, pricing: Pricing, project: Project, links: Links };

export default function Card({ card }) {
  const Body = BY_TYPE[card?.type];
  if (!Body) return null;
  return <div className={`ask-card ask-card--${card.type}`} role="group" aria-label={card.title}><Body card={card} /></div>;
}

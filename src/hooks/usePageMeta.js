import { useEffect } from 'react';
import { SITE, HOME_META } from '../data/routeMeta';

const setContent = (selector, value, attr = 'content') => {
  const el = document.querySelector(selector);
  if (el && value != null) el.setAttribute(attr, value);
};

const applyMeta = (meta) => {
  const url = meta.path === '/' ? `${SITE}/` : `${SITE}${meta.path}`;
  const shortDescription = meta.ogDescription || meta.description;
  document.title = meta.title;
  setContent('meta[name="description"]', meta.description);
  setContent('link[rel="canonical"]', url, 'href');
  setContent('meta[property="og:title"]', meta.title);
  setContent('meta[property="og:description"]', shortDescription);
  setContent('meta[property="og:url"]', url);
  setContent('meta[property="og:image:alt"]', meta.imageAlt);
  setContent('meta[name="twitter:title"]', meta.title);
  setContent('meta[name="twitter:description"]', shortDescription);
  setContent('meta[name="twitter:url"]', url);
  setContent('meta[name="twitter:image:alt"]', meta.imageAlt);
};

// Sets the tab title and the search / link-preview tags for one route (objects live in
// src/data/routeMeta.js). On the way out it puts the home page values back. It does not
// capture "what was there before": on a direct visit to /hire the static HTML already holds
// the hire values, so restoring those would leave them on the home page.
export const usePageMeta = (meta) => {
  useEffect(() => {
    applyMeta(meta);
    return () => applyMeta(HOME_META);
  }, [meta]);
};

export default usePageMeta;

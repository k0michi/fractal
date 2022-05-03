import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const USER_AGENT = 'facebookexternalhit/1.1';

// Workaround for ESM-only module
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

function getOGPContent(document, property) {
  const meta = document.head.querySelector(`meta[property="${property}"]`);
  return meta?.getAttribute('content');
}

function getMetaContent(document, property) {
  const meta = document.head.querySelector(`meta[name="${property}"]`);
  return meta?.getAttribute('content');
}

function extractMeta(document) {
  let title = getOGPContent(document, 'og:title') ??
    document.title;
  title = title?.trim();

  let description = getOGPContent(document, 'og:description') ??
    getMetaContent(document, 'description');
  description = description?.trim();

  let imageURL = getOGPContent(document, 'og:image') ??
    getOGPContent(document, 'og:image:secure_url');
    getOGPContent(document, 'og:image:url');
  description = description?.trim();

  return {title, description, imageURL};
}

export async function fetchMeta(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT }
  });
  const html = await response.text();
  const dom = new JSDOM(html);
  return extractMeta(dom.window.document);
}
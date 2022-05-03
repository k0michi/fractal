import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import contentDisposition from 'content-disposition';

const USER_AGENT = 'WhatsApp/2';

function getOGPContent(document, property) {
  const meta = document.querySelector(`meta[property="${property}"]`);
  return meta?.getAttribute('content');
}

function getMetaContent(document, property) {
  const meta = document.querySelector(`meta[name="${property}"]`);
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
    getOGPContent(document, 'og:image:secure_url') ??
    getOGPContent(document, 'og:image:url');
  description = description?.trim();

  return { title, description, imageURL };
}

export async function fetchMeta(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT }
  });
  const html = await response.text();
  const dom = new JSDOM(html);
  return extractMeta(dom.window.document);
}

export async function fetchImage(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT }
  });

  const buffer = await response.arrayBuffer();
  const headers = response.headers;
  let filename;

  if (filename == null && headers.get('content-disposition') != null) {
    const disposition = contentDisposition.parse(headers.get('content-disposition'));
    filename = disposition.parameters['filename'];
  }

  if (filename == null) {
    filename = new URL(url).pathname.split('/').pop();
  }

  return { data: new Uint8Array(buffer), filename };
}
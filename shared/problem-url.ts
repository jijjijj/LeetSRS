import type { CardDomain, LeetcodeDomain } from './cards';
import { NEETCODE_SLUG_PREFIX } from './cards';

export interface ParsedProblemUrl {
  domain: CardDomain;
  /** Storage key: native LeetCode slug, `neetcode.io:<slug>`, or `custom:<host><path><search>` */
  slug: string;
  /** Stored for neetcode.io and custom cards; undefined for LeetCode (reconstructed from domain + slug) */
  url?: string;
}

const LEETCODE_HOSTS: Record<string, LeetcodeDomain> = {
  'leetcode.com': 'leetcode.com',
  'leetcode.cn': 'leetcode.cn',
};

const PROBLEM_PATH_REGEX = /^\/problems\/([^/?#]+)/;

/**
 * Parses a user-provided URL into a card domain, storage slug, and canonical URL.
 * LeetCode and NeetCode URLs are recognized and mapped to their native slugs so
 * they dedupe with cards added via the on-page buttons. Returns null for
 * unparseable or non-http(s) input.
 */
export function parseProblemUrl(input: string): ParsedProblemUrl | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return null;
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
  if (!host.includes('.')) {
    return null;
  }

  const problemMatch = parsed.pathname.match(PROBLEM_PATH_REGEX);

  const leetcodeDomain = LEETCODE_HOSTS[host] ?? LEETCODE_HOSTS[host.split('.').slice(-2).join('.')];
  if (leetcodeDomain && problemMatch) {
    return { domain: leetcodeDomain, slug: problemMatch[1].toLowerCase() };
  }

  if ((host === 'neetcode.io' || host.endsWith('.neetcode.io')) && problemMatch) {
    const slug = problemMatch[1].toLowerCase();
    return {
      domain: 'neetcode.io',
      slug: `${NEETCODE_SLUG_PREFIX}${slug}`,
      url: `https://neetcode.io/problems/${slug}`,
    };
  }

  const pathname = parsed.pathname.replace(/\/+$/, '');
  return {
    domain: 'custom',
    slug: `custom:${host}${pathname.toLowerCase()}${parsed.search}`,
    url: `${parsed.protocol}//${host}${pathname}${parsed.search}`,
  };
}

/**
 * Converts a slug into a human-readable title: 'two-sum' -> 'Two Sum'
 */
export function deslugify(slug: string): string {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Suggests a problem name from a URL by de-slugifying its last path segment.
 * Returns '' when no usable segment exists.
 */
export function suggestNameFromUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return '';
  }

  let parsed: URL;
  try {
    parsed = new URL(/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return '';
  }

  const segments = parsed.pathname.split('/').filter(Boolean);
  // Skip generic trailing segments like 'problem' or 'description'
  const generic = new Set(['problem', 'problems', 'description', 'challenges', 'index.html']);
  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = decodeURIComponent(segments[i]).replace(/\.[a-z0-9]+$/i, '');
    if (!generic.has(segment.toLowerCase()) && /[a-zA-Z]/.test(segment)) {
      return deslugify(segment);
    }
  }
  return '';
}

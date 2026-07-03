/**
 * DOM extraction for neetcode.io problem pages.
 *
 * NeetCode is a client-rendered Angular SPA with no stable public metadata
 * API, so everything here scrapes the rendered DOM defensively and falls
 * back to URL-derived values when selectors miss.
 */

import type { Difficulty } from '@/shared/cards';
import { NEETCODE_SLUG_PREFIX } from '@/shared/cards';
import { deslugify } from '@/shared/problem-url';

export interface NeetcodeProblemData {
  slug: string;
  /** Prefixed storage key, e.g. `neetcode.io:duplicate-integer` */
  storageSlug: string;
  title: string;
  difficulty: Difficulty;
  url: string;
}

const DIFFICULTIES: readonly Difficulty[] = ['Easy', 'Medium', 'Hard'];

export function getNeetcodeSlug(pathname: string): string | null {
  const match = pathname.match(/^\/problems\/([^/?#]+)/);
  return match ? match[1].toLowerCase() : null;
}

export function isNeetcodeProblemPage(): boolean {
  return getNeetcodeSlug(window.location.pathname) !== null;
}

function extractTitle(slug: string): string {
  for (const heading of document.querySelectorAll('h1')) {
    const text = heading.textContent?.trim();
    if (text) {
      return text;
    }
  }
  return deslugify(slug);
}

function isDifficultyText(text: string | null | undefined): text is Difficulty {
  return !!text && (DIFFICULTIES as readonly string[]).includes(text);
}

function extractDifficulty(): Difficulty {
  // Preferred: an element whose class hints at difficulty
  for (const el of document.querySelectorAll('[class*="diff" i]')) {
    const text = el.textContent?.trim();
    if (isDifficultyText(text)) {
      return text;
    }
  }

  // Fallback: any leaf element whose entire text is exactly a difficulty label
  for (const el of document.querySelectorAll('button, span, div, p')) {
    if (el.children.length > 0) {
      continue;
    }
    const text = el.textContent?.trim();
    if (isDifficultyText(text)) {
      return text;
    }
  }

  return 'Medium';
}

export function extractNeetcodeProblemData(): NeetcodeProblemData | null {
  const slug = getNeetcodeSlug(window.location.pathname);
  if (!slug) {
    return null;
  }

  return {
    slug,
    storageSlug: `${NEETCODE_SLUG_PREFIX}${slug}`,
    title: extractTitle(slug),
    difficulty: extractDifficulty(),
    url: `https://neetcode.io/problems/${slug}`,
  };
}

export function isNeetcodeDarkMode(): boolean {
  const hasDarkClass = (el: Element) => Array.from(el.classList).some((token) => token.toLowerCase().includes('dark'));

  if (hasDarkClass(document.documentElement) || hasDarkClass(document.body)) {
    return true;
  }

  if (typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // NeetCode defaults to a dark theme
  return true;
}

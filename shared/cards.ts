import type { Card as FsrsCard } from 'ts-fsrs';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type LeetcodeDomain = 'leetcode.com' | 'leetcode.cn';
export type CardDomain = LeetcodeDomain | 'neetcode.io' | 'custom';

export const NEETCODE_SLUG_PREFIX = 'neetcode.io:';

export interface Card {
  id: string;
  slug: string;
  name: string;
  leetcodeId: string;
  difficulty: Difficulty;
  domain: CardDomain;
  url?: string;
  createdAt: Date;
  fsrs: FsrsCard;
  paused: boolean;
}

/**
 * Returns the external URL for a card. Cards from neetcode.io and custom
 * sources store their URL; LeetCode URLs are reconstructed from domain + slug.
 */
export function getCardUrl(card: Pick<Card, 'domain' | 'slug' | 'url'>): string {
  if (card.url) {
    return card.url;
  }
  if (card.domain === 'neetcode.io') {
    return `https://neetcode.io/problems/${card.slug.replace(NEETCODE_SLUG_PREFIX, '')}`;
  }
  if (card.domain === 'custom') {
    // Custom cards always store a url; this is unreachable in practice
    return '#';
  }
  return `https://${card.domain}/problems/${card.slug}/description/`;
}

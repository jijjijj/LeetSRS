import { describe, it, expect } from 'vitest';
import { getCardUrl } from '../cards';

describe('getCardUrl', () => {
  it('should prefer a stored url when present', () => {
    expect(getCardUrl({ domain: 'custom', slug: 'custom:example.com/p', url: 'https://example.com/p' })).toBe(
      'https://example.com/p'
    );
    expect(
      getCardUrl({
        domain: 'neetcode.io',
        slug: 'neetcode.io:duplicate-integer',
        url: 'https://neetcode.io/problems/duplicate-integer',
      })
    ).toBe('https://neetcode.io/problems/duplicate-integer');
  });

  it('should reconstruct LeetCode URLs from domain and slug', () => {
    expect(getCardUrl({ domain: 'leetcode.com', slug: 'two-sum' })).toBe(
      'https://leetcode.com/problems/two-sum/description/'
    );
    expect(getCardUrl({ domain: 'leetcode.cn', slug: 'two-sum' })).toBe(
      'https://leetcode.cn/problems/two-sum/description/'
    );
  });

  it('should reconstruct a NeetCode URL by stripping the slug prefix when url is missing', () => {
    expect(getCardUrl({ domain: 'neetcode.io', slug: 'neetcode.io:duplicate-integer' })).toBe(
      'https://neetcode.io/problems/duplicate-integer'
    );
  });
});

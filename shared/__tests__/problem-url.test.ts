import { describe, it, expect } from 'vitest';
import { parseProblemUrl, deslugify, suggestNameFromUrl } from '../problem-url';

describe('parseProblemUrl', () => {
  describe('LeetCode URLs', () => {
    it('should map a leetcode.com problem URL to its native slug without a stored url', () => {
      const result = parseProblemUrl('https://leetcode.com/problems/two-sum/description/');
      expect(result).toEqual({ domain: 'leetcode.com', slug: 'two-sum' });
    });

    it('should map a leetcode.cn problem URL to its native slug', () => {
      const result = parseProblemUrl('https://leetcode.cn/problems/two-sum/');
      expect(result).toEqual({ domain: 'leetcode.cn', slug: 'two-sum' });
    });

    it('should strip www and lowercase the slug', () => {
      const result = parseProblemUrl('https://www.leetcode.com/problems/Two-Sum');
      expect(result).toEqual({ domain: 'leetcode.com', slug: 'two-sum' });
    });

    it('should treat a non-problem leetcode page as a custom URL', () => {
      const result = parseProblemUrl('https://leetcode.com/contest/');
      expect(result?.domain).toBe('custom');
    });
  });

  describe('NeetCode URLs', () => {
    it('should produce a prefixed slug and canonical url', () => {
      const result = parseProblemUrl('https://neetcode.io/problems/duplicate-integer');
      expect(result).toEqual({
        domain: 'neetcode.io',
        slug: 'neetcode.io:duplicate-integer',
        url: 'https://neetcode.io/problems/duplicate-integer',
      });
    });

    it('should normalize www, trailing slash, casing, query and hash noise', () => {
      const result = parseProblemUrl('https://www.neetcode.io/problems/Duplicate-Integer/?list=blind75#solution');
      expect(result).toEqual({
        domain: 'neetcode.io',
        slug: 'neetcode.io:duplicate-integer',
        url: 'https://neetcode.io/problems/duplicate-integer',
      });
    });
  });

  describe('custom URLs', () => {
    it('should synthesize a custom slug preserving the query string', () => {
      const result = parseProblemUrl('https://www.hackerrank.com/challenges/two-sum/problem?h_r=internal');
      expect(result).toEqual({
        domain: 'custom',
        slug: 'custom:hackerrank.com/challenges/two-sum/problem?h_r=internal',
        url: 'https://hackerrank.com/challenges/two-sum/problem?h_r=internal',
      });
    });

    it('should drop hash and trailing slash but distinguish query strings', () => {
      const a = parseProblemUrl('https://example.com/p/?id=1#top');
      const b = parseProblemUrl('https://example.com/p?id=2');
      expect(a?.slug).toBe('custom:example.com/p?id=1');
      expect(b?.slug).toBe('custom:example.com/p?id=2');
      expect(a?.slug).not.toBe(b?.slug);
    });

    it('should lowercase the slug key but keep path casing in the url', () => {
      const result = parseProblemUrl('https://Example.com/Problems/FooBar');
      expect(result?.slug).toBe('custom:example.com/problems/foobar');
      expect(result?.url).toBe('https://example.com/Problems/FooBar');
    });

    it('should accept scheme-less input', () => {
      const result = parseProblemUrl('example.com/some-problem');
      expect(result).toEqual({
        domain: 'custom',
        slug: 'custom:example.com/some-problem',
        url: 'https://example.com/some-problem',
      });
    });
  });

  describe('invalid input', () => {
    it.each(['', '   ', 'not a url at all', 'ftp://example.com/x', 'javascript:alert(1)', 'localhost'])(
      'should return null for %j',
      (input) => {
        expect(parseProblemUrl(input)).toBeNull();
      }
    );
  });
});

describe('deslugify', () => {
  it('should convert kebab-case to Title Case', () => {
    expect(deslugify('two-sum')).toBe('Two Sum');
    expect(deslugify('duplicate-integer')).toBe('Duplicate Integer');
  });

  it('should handle underscores and repeated separators', () => {
    expect(deslugify('two__sum--extra')).toBe('Two Sum Extra');
  });
});

describe('suggestNameFromUrl', () => {
  it('should use the last path segment', () => {
    expect(suggestNameFromUrl('https://neetcode.io/problems/duplicate-integer')).toBe('Duplicate Integer');
  });

  it('should skip generic trailing segments', () => {
    expect(suggestNameFromUrl('https://www.hackerrank.com/challenges/two-sum/problem')).toBe('Two Sum');
    expect(suggestNameFromUrl('https://leetcode.com/problems/two-sum/description')).toBe('Two Sum');
  });

  it('should return empty string when there is no usable segment', () => {
    expect(suggestNameFromUrl('https://example.com/')).toBe('');
    expect(suggestNameFromUrl('not a url')).toBe('');
  });
});

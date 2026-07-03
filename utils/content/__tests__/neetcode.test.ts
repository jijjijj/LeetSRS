import { describe, it, expect, afterEach, vi } from 'vitest';
import { getNeetcodeSlug, isNeetcodeProblemPage, extractNeetcodeProblemData, isNeetcodeDarkMode } from '../neetcode';

// @vitest-environment happy-dom

function mockPathname(pathname: string) {
  Object.defineProperty(window, 'location', {
    value: { pathname, hostname: 'neetcode.io' },
    writable: true,
  });
}

afterEach(() => {
  document.body.innerHTML = '';
  document.documentElement.className = '';
  document.body.className = '';
  vi.restoreAllMocks();
});

describe('getNeetcodeSlug', () => {
  it('should extract the slug from a problem path', () => {
    expect(getNeetcodeSlug('/problems/duplicate-integer')).toBe('duplicate-integer');
    expect(getNeetcodeSlug('/problems/Two-Integer-Sum/')).toBe('two-integer-sum');
  });

  it('should return null for non-problem paths', () => {
    expect(getNeetcodeSlug('/')).toBeNull();
    expect(getNeetcodeSlug('/practice')).toBeNull();
    expect(getNeetcodeSlug('/roadmap')).toBeNull();
    expect(getNeetcodeSlug('/problems/')).toBeNull();
  });
});

describe('isNeetcodeProblemPage', () => {
  it('should reflect the current pathname', () => {
    mockPathname('/problems/duplicate-integer');
    expect(isNeetcodeProblemPage()).toBe(true);

    mockPathname('/practice');
    expect(isNeetcodeProblemPage()).toBe(false);
  });
});

describe('extractNeetcodeProblemData', () => {
  it('should return null on non-problem pages', () => {
    mockPathname('/practice');
    expect(extractNeetcodeProblemData()).toBeNull();
  });

  it('should extract title from h1 and difficulty from a difficulty-classed element', () => {
    mockPathname('/problems/duplicate-integer');
    document.body.innerHTML = `
      <div>
        <h1>Duplicate Integer</h1>
        <button class="difficulty-btn easy-diff">Easy</button>
      </div>
    `;

    expect(extractNeetcodeProblemData()).toEqual({
      slug: 'duplicate-integer',
      storageSlug: 'neetcode.io:duplicate-integer',
      title: 'Duplicate Integer',
      difficulty: 'Easy',
      url: 'https://neetcode.io/problems/duplicate-integer',
    });
  });

  it('should find difficulty in a leaf element when no difficulty class exists', () => {
    mockPathname('/problems/duplicate-integer');
    document.body.innerHTML = `
      <h1>Duplicate Integer</h1>
      <div><span>Hard</span></div>
    `;

    expect(extractNeetcodeProblemData()?.difficulty).toBe('Hard');
  });

  it('should fall back to a deslugified title and Medium difficulty', () => {
    mockPathname('/problems/duplicate-integer');
    document.body.innerHTML = '<div>no heading here</div>';

    const result = extractNeetcodeProblemData();
    expect(result?.title).toBe('Duplicate Integer');
    expect(result?.difficulty).toBe('Medium');
  });

  it('should skip empty headings', () => {
    mockPathname('/problems/duplicate-integer');
    document.body.innerHTML = '<h1>  </h1><h1>Duplicate Integer</h1>';

    expect(extractNeetcodeProblemData()?.title).toBe('Duplicate Integer');
  });

  it('should not treat non-exact text as a difficulty', () => {
    mockPathname('/problems/duplicate-integer');
    document.body.innerHTML = `
      <h1>Duplicate Integer</h1>
      <p>This problem is not that Hard to solve</p>
    `;

    expect(extractNeetcodeProblemData()?.difficulty).toBe('Medium');
  });
});

describe('isNeetcodeDarkMode', () => {
  it('should detect a dark class token on html or body', () => {
    document.documentElement.className = 'dark-mode';
    expect(isNeetcodeDarkMode()).toBe(true);

    document.documentElement.className = '';
    document.body.className = 'theme-darkMode';
    expect(isNeetcodeDarkMode()).toBe(true);
  });

  it('should fall back to prefers-color-scheme when no dark class exists', () => {
    const matchMediaMock = vi.fn().mockReturnValue({ matches: false });
    vi.stubGlobal('matchMedia', matchMediaMock);
    window.matchMedia = matchMediaMock as unknown as typeof window.matchMedia;

    expect(isNeetcodeDarkMode()).toBe(false);
    expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });
});

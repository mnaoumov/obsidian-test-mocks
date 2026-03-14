import {
  describe,
  expect,
  it
} from 'vitest';

import { finishRenderMath } from '../../../src/obsidian/functions/finishRenderMath.ts';
import { getLanguage } from '../../../src/obsidian/functions/getLanguage.ts';
import { loadMathJax } from '../../../src/obsidian/functions/loadMathJax.ts';
import { loadMermaid } from '../../../src/obsidian/functions/loadMermaid.ts';
import { loadPdfJs } from '../../../src/obsidian/functions/loadPdfJs.ts';
import { loadPrism } from '../../../src/obsidian/functions/loadPrism.ts';
import { renderMatches } from '../../../src/obsidian/functions/renderMatches.ts';
import { renderMath } from '../../../src/obsidian/functions/renderMath.ts';
import { renderResults } from '../../../src/obsidian/functions/renderResults.ts';
import { request } from '../../../src/obsidian/functions/request.ts';
import { requestUrl } from '../../../src/obsidian/functions/requestUrl.ts';
import { requireApiVersion } from '../../../src/obsidian/functions/requireApiVersion.ts';
import { resolveSubpath } from '../../../src/obsidian/functions/resolveSubpath.ts';
import { sanitizeHTMLToDom } from '../../../src/obsidian/functions/sanitizeHTMLToDom.ts';
import { setTooltip } from '../../../src/obsidian/functions/setTooltip.ts';
import { stripHeading } from '../../../src/obsidian/functions/stripHeading.ts';
import { stripHeadingForLink } from '../../../src/obsidian/functions/stripHeadingForLink.ts';

describe('getLanguage', () => {
  it('should return en', () => {
    expect(getLanguage()).toBe('en');
  });
});

describe('requireApiVersion', () => {
  it('should always return true', () => {
    expect(requireApiVersion('1.0.0')).toBe(true);
  });
});

describe('finishRenderMath', () => {
  it('should resolve without error', async () => {
    await expect(finishRenderMath()).resolves.toBeUndefined();
  });
});

describe('loadMathJax', () => {
  it('should resolve without error', async () => {
    await expect(loadMathJax()).resolves.toBeUndefined();
  });
});

describe('loadMermaid', () => {
  it('should resolve with an object', async () => {
    const result = await loadMermaid();
    expect(result).toEqual({});
  });
});

describe('loadPdfJs', () => {
  it('should resolve with an object', async () => {
    const result = await loadPdfJs();
    expect(result).toEqual({});
  });
});

describe('loadPrism', () => {
  it('should resolve with an object', async () => {
    const result = await loadPrism();
    expect(result).toEqual({});
  });
});

describe('renderMath', () => {
  it('should return an HTMLElement', () => {
    const el = renderMath('x^2', true);
    expect(el).toBeInstanceOf(HTMLElement);
  });
});

describe('renderMatches', () => {
  it('should not throw', () => {
    const el = createDiv();
    expect(() => {
      renderMatches(el, 'text', [[0, 1]]);
    }).not.toThrow();
  });
});

describe('renderResults', () => {
  it('should not throw', () => {
    const el = createDiv();
    expect(() => {
      renderResults(el, 'text', { matches: [], score: 0 });
    }).not.toThrow();
  });
});

describe('request', () => {
  it('should resolve with empty string', async () => {
    const result = await request('http://example.com');
    expect(result).toBe('');
  });
});

const HTTP_OK = 200;

describe('requestUrl', () => {
  it('should return a response with status 200', async () => {
    const response = await requestUrl('http://example.com');
    expect(response.status).toBe(HTTP_OK);
    expect(response.text).toBe('');
  });

  it('should have sync properties on the promise', () => {
    const promise = requestUrl('http://example.com');
    expect(promise.status).toBe(HTTP_OK);
    expect(promise.headers).toEqual({});
    expect(promise.text).toBe('');
  });
});

describe('resolveSubpath', () => {
  it('should return null', () => {
    expect(resolveSubpath({}, '#heading')).toBeNull();
  });
});

describe('sanitizeHTMLToDom', () => {
  it('should return a DocumentFragment', () => {
    const fragment = sanitizeHTMLToDom('<b>bold</b>');
    expect(fragment).toBeInstanceOf(DocumentFragment);
  });

  it('should contain the HTML content', () => {
    const fragment = sanitizeHTMLToDom('<b>bold</b>');
    const wrapper = createDiv();
    wrapper.appendChild(fragment);
    expect(wrapper.innerHTML).toContain('bold');
  });
});

describe('setTooltip', () => {
  it('should not throw', () => {
    const el = createDiv();
    expect(() => {
      setTooltip(el, 'tip');
    }).not.toThrow();
  });
});

describe('stripHeading', () => {
  it('should strip leading hashes and space', () => {
    expect(stripHeading('## My Heading')).toBe('My Heading');
  });

  it('should return text without hashes unchanged', () => {
    expect(stripHeading('Plain text')).toBe('Plain text');
  });
});

describe('stripHeadingForLink', () => {
  it('should strip hashes and link-unsafe characters', () => {
    expect(stripHeadingForLink('## Heading [with] brackets')).toBe('Heading with brackets');
  });

  it('should strip pipe and caret characters', () => {
    expect(stripHeadingForLink('## A|B^C')).toBe('ABC');
  });

  it('should strip backslash characters', () => {
    expect(stripHeadingForLink('## A\\B')).toBe('AB');
  });
});

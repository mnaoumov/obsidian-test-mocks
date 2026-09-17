import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { castTo } from './castTo.ts';
import { sanitizeHtml } from './html-sanitizer.ts';
import { ensureNonNullable } from './type-guards.ts';

function toHtml(html: string): string {
  const wrapper = document.createElement('div');
  wrapper.append(sanitizeHtml(html));
  return wrapper.innerHTML;
}

describe('sanitizeHtml', () => {
  it('should return a fragment owned by the global document', () => {
    const fragment = sanitizeHtml('<b>bold</b>');
    expect(fragment.ownerDocument).toBe(document);
    expect(fragment.childNodes).toHaveLength(1);
  });

  it('should return an empty fragment for an empty string', () => {
    expect(sanitizeHtml('').childNodes).toHaveLength(0);
  });

  it('should keep leading whitespace', () => {
    expect(toHtml('  \n<b>x</b>')).toBe('  \n<b>x</b>');
  });

  it('should keep allowed HTML, SVG and MathML', () => {
    expect(toHtml('<p><em>a</em></p><svg><circle r="1"></circle></svg><math><mi>x</mi></math>'))
      .toBe('<p><em>a</em></p><svg><circle r="1"></circle></svg><math><mi>x</mi></math>');
  });

  it('should drop a script together with its content', () => {
    expect(toHtml('<p>a</p><script>alert(1)</script>')).toBe('<p>a</p>');
  });

  it('should drop a forbidden style element', () => {
    expect(toHtml('<p>a</p><style>p { color: red; }</style>')).toBe('<p>a</p>');
  });

  it('should drop an element whose only content is markup-like text', () => {
    expect(toHtml('<p>a</p><style><b></style>')).toBe('<p>a</p>');
  });

  it('should keep the content of a disallowed element', () => {
    expect(toHtml('<custom-element><b>x</b>y</custom-element>z')).toBe('<b>x</b>yz');
  });

  it('should drop comments', () => {
    expect(toHtml('a<!-- note -->b')).toBe('ab');
  });

  it('should drop an SVG element nested where its namespace does not allow it', () => {
    expect(toHtml('<svg><math></math></svg>')).toBe('<svg></svg>');
  });

  it('should drop a MathML element nested where its namespace does not allow it', () => {
    expect(toHtml('<math><svg></svg></math>')).toBe('<math></math>');
  });

  it('should keep MathML inside an SVG HTML integration point', () => {
    expect(toHtml('<svg><desc><math></math></desc></svg>')).toBe('<svg><desc><math></math></desc></svg>');
  });

  it('should keep SVG inside a MathML text integration point', () => {
    expect(toHtml('<math><mi><svg></svg></mi></math>')).toBe('<math><mi><svg></svg></mi></math>');
  });

  it('should drop an annotation-xml element with its content', () => {
    expect(toHtml('<math><annotation-xml encoding="image/svg+xml"><svg></svg></annotation-xml></math>')).toBe('<math></math>');
  });

  it('should keep HTML the parser moves out of SVG', () => {
    expect(toHtml('<svg><font color="red">x</font></svg>')).toBe('<svg></svg><font color="red">x</font>');
    expect(toHtml('<svg><g><font face="a"></font></g></svg>')).toBe('<svg><g></g></svg><font face="a"></font>');
  });

  it('should keep HTML the parser moves out of MathML', () => {
    expect(toHtml('<math><mrow><b>x</b></mrow></math>')).toBe('<math><mrow></mrow></math><b>x</b>');
  });

  it('should keep HTML inside a MathML text integration point', () => {
    expect(toHtml('<math><mi><b>x</b></mi></math>')).toBe('<math><mi><b>x</b></mi></math>');
  });

  it('should drop MathML-named and SVG-named elements in the HTML namespace', () => {
    expect(toHtml('x<template><mi>a</mi><circle>b</circle><a>c</a></template>')).toBe('x<template><a target="_blank" rel="noopener nofollow">c</a></template>');
  });

  it('should drop event handler attributes and unknown attributes', () => {
    expect(toHtml('<b onclick="x()" foo="bar" title="t">x</b>')).toBe('<b title="t">x</b>');
  });

  it('should keep data and aria attributes', () => {
    expect(toHtml('<b data-x="1" aria-label="l">x</b>')).toBe('<b aria-label="l" data-x="1">x</b>');
  });

  it('should write the surviving attributes back in reverse order, as DOMPurify does', () => {
    expect(toHtml('<b class="a" title="b">x</b>')).toBe('<b title="b" class="a">x</b>');
  });

  it('should trim attribute values except value', () => {
    expect(toHtml('<input title=" t " value=" v ">')).toBe('<input value=" v " title="t">');
  });

  it('should drop javascript: URLs and keep safe and unknown protocols', () => {
    expect(toHtml('<img src="javascript:alert(1)">')).toBe('<img>');
    expect(toHtml('<img src="https://example.com/a.png">')).toBe('<img src="https://example.com/a.png">');
    expect(toHtml('<img src="obsidian://open">')).toBe('<img src="obsidian://open">');
    expect(toHtml('<img src="">')).toBe('<img src="">');
  });

  it('should allow data: URLs only on media elements', () => {
    expect(toHtml('<img src="data:image/png;base64,AA==">')).toBe('<img src="data:image/png;base64,AA==">');
    expect(toHtml('<script src="data:text/javascript,x"></script>')).toBe('');
    expect(toHtml('<b title="x" cite="data:text/html,x">x</b>')).toBe('<b title="x">x</b>');
  });

  it('should drop id and name values that would clobber document properties', () => {
    expect(toHtml('<img id="cookie" name="submit" alt="a">')).toBe('<img alt="a">');
    expect(toHtml('<img id="picture">')).toBe('<img id="picture">');
  });

  it('should keep namespaced attributes', () => {
    const svg = sanitizeHtml('<svg><a xlink:href="#a"></a></svg>').firstChild as Element;
    expect(svg.firstElementChild?.getAttributeNS('http://www.w3.org/1999/xlink', 'href')).toBe('#a');
  });

  it('should drop an element carrying an is attribute', () => {
    expect(toHtml('<p is="x-p">a</p>b')).toBe('b');
  });

  it('should drop a clobbered form', () => {
    // A form's named controls shadow its DOM members in browsers; jsdom does not do that, so the clobbering is simulated.
    const getAttributes = ensureNonNullable(Object.getOwnPropertyDescriptor(Element.prototype, 'attributes')?.get);
    const spy = vi.spyOn(Element.prototype, 'attributes', 'get').mockImplementation(function getClobberedAttributes(this: Element) {
      return castTo<NamedNodeMap>(this.localName === 'form' ? this.firstElementChild : getAttributes.call(this));
    });
    try {
      expect(toHtml('<form><input name="attributes"></form>b')).toBe('b');
    } finally {
      spy.mockRestore();
    }
    expect(toHtml('<form><input></form>b')).toBe('<form><input></form>b');
  });

  it('should check SVG and MathML at the top of template content as if under an HTML parent', () => {
    expect(toHtml('x<template><svg></svg><math></math></template>')).toBe('x<template><svg></svg><math></math></template>');
  });

  it('should sanitize template content', () => {
    expect(toHtml('x<template><script>x</script><b onclick="y">z</b></template>')).toBe('x<template><b>z</b></template>');
  });

  it('should open links in a new window, keeping an existing rel', () => {
    expect(toHtml('<a href="https://example.com">a</a>')).toBe('<a href="https://example.com" target="_blank" rel="noopener nofollow">a</a>');
    expect(toHtml('<a rel="author">a</a>')).toBe('<a rel="author" target="_blank">a</a>');
  });

  it('should not treat an SVG link as an HTML link', () => {
    expect(toHtml('<svg><a></a></svg>')).toBe('<svg><a></a></svg>');
  });

  it('should give an iframe a default sandbox', () => {
    expect(toHtml('<iframe src="https://example.com"></iframe>'))
      .toBe('<iframe src="https://example.com" sandbox="allow-forms allow-presentation allow-same-origin allow-scripts allow-modals"></iframe>');
  });

  it('should restrict an iframe sandbox and allow list to the allowed tokens', () => {
    expect(toHtml('<iframe sandbox="allow-scripts allow-top-navigation" allow="fullscreen; camera"></iframe>'))
      .toBe('<iframe allow="fullscreen" sandbox="allow-scripts"></iframe>');
    expect(toHtml('<iframe sandbox="allow-scripts"></iframe>')).toBe('<iframe sandbox="allow-scripts"></iframe>');
  });
});

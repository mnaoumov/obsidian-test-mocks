import type { default as pdfjsLib } from 'pdfjs-dist';

export async function loadPdfJs(): Promise<typeof pdfjsLib> {
  throw new Error('loadPdfJs is not supported in test mocks');
}

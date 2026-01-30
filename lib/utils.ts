import * as XLSX from 'xlsx';

export function parseVersion(version: string): { major: number; minor: number; patch: number } {
  const [major, minor, patch] = version.split('.').map(Number);
  return { major: major || 1, minor: minor || 0, patch: patch || 0 };
}

export function incrementVersion(version: string, type: 'major' | 'minor' | 'patch'): string {
  const { major, minor, patch } = parseVersion(version);
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      return version;
  }
}

export function parseSpreadsheet(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}

async function parseDocxFile(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

function parseTextFileRaw(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export async function parseTextFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'docx':
      return parseDocxFile(file);
    case 'txt':
    default:
      return parseTextFileRaw(file);
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    // Check if date is valid
    if (isNaN(d.getTime())) {
      return 'N/A';
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(d);
  } catch {
    return 'N/A';
  }
}

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function truncateText(text: string, maxWords: number): string {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

export function sanitizeForPDF(text: string | null | undefined): string {
  if (!text) return '';
  // Remove em-dashes and replace with regular dashes
  return text
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-')
    .replace(/—/g, '-')
    .replace(/–/g, '-');
}

export function extractQuotes(text: string): string[] {
  const quotePattern = /"([^"]+)"/g;
  const matches = text.matchAll(quotePattern);
  return Array.from(matches, m => m[1]);
}

export function anonymizeQuote(quote: string): string {
  // Remove names and replace with generic references
  return quote
    .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[Name]')
    .replace(/\bI\b/g, 'they')
    .replace(/\bmy\b/gi, 'their')
    .replace(/\bme\b/gi, 'them');
}

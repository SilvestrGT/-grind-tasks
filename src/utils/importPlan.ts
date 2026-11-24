import type { Task } from '../types/task';
import {
  hasDuplicateTitle,
  isValidCategory,
  isValidDueDate,
  isValidPriority,
} from './taskUtils';

const HASH_PREFIX = '#import=';
const MAX_IMPORTED_TASKS = 200;

export function hasImportInUrl(): boolean {
  return window.location.hash.startsWith(HASH_PREFIX);
}

export function clearImportFromUrl(): void {
  if (!hasImportInUrl()) return;
  window.history.replaceState(
    null,
    '',
    window.location.pathname + window.location.search
  );
}

function decodeBase64Url(value: string): string {
  const b64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Формат ссылки: #import=<base64url(JSON)>, где JSON это массив
 * [{ t: "название", c: "Study|Work|Personal|Other", p: "Low|Medium|High", d: "YYYY-MM-DD" }]
 */
export function readImportedTasks(): Task[] {
  try {
    if (!hasImportInUrl()) return [];
    const json = decodeBase64Url(window.location.hash.slice(HASH_PREFIX.length));
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];

    const result: Task[] = [];
    const now = Date.now();
    for (const item of parsed.slice(0, MAX_IMPORTED_TASKS)) {
      if (typeof item !== 'object' || item === null) continue;
      const raw = item as Record<string, unknown>;
      const title = typeof raw.t === 'string' ? raw.t.trim().slice(0, 200) : '';
      if (!title || hasDuplicateTitle(result, title)) continue;
      result.push({
        id: `import-${now}-${result.length}`,
        title,
        completed: false,
        createdAt: now - result.length,
        category: isValidCategory(raw.c) ? raw.c : 'Other',
        priority: isValidPriority(raw.p) ? raw.p : 'Medium',
        dueDate: isValidDueDate(raw.d) ? raw.d : null,
      });
    }
    return result;
  } catch {
    return [];
  }
}

export function mergeImportedTasks(base: Task[], imported: Task[]): Task[] {
  const fresh = imported.filter((task) => !hasDuplicateTitle(base, task.title));
  return [...fresh, ...base];
}

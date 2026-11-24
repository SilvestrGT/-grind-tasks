import type { Task } from '../types/task';[cite: 8]
import {[cite: 8]
  hasDuplicateTitle,[cite: 8]
  isValidCategory,[cite: 8]
  isValidDueDate,[cite: 8]
  isValidPriority,[cite: 8]
} from './taskUtils';[cite: 8]

const HASH_PREFIX = '#import=';[cite: 8]
const MAX_IMPORTED_TASKS = 200;[cite: 8]

export function hasImportInUrl(): boolean {[cite: 8]
  return window.location.hash.startsWith(HASH_PREFIX);[cite: 8]
}

export function clearImportFromUrl(): void {[cite: 8]
  if (!hasImportInUrl()) return;[cite: 8]
  window.history.replaceState([cite: 8]
    null,[cite: 8]
    '',[cite: 8]
    window.location.pathname + window.location.search[cite: 8]
  );[cite: 8]
}

function decodeBase64Url(value: string): string {[cite: 8]
  const b64 = value.replace(/-/g, '+').replace(/_/g, '/');[cite: 8]
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);[cite: 8]
  const binary = atob(padded);[cite: 8]
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));[cite: 8]
  return new TextDecoder().decode(bytes);[cite: 8]
}

/**
 * Формат ссылки: #import=<base64url(JSON)>, где JSON это массив
 * [{ t: "название", c: "Study|Work|Personal|Other", p: "Low|Medium|High", d: "YYYY-MM-DD" }]
 */[cite: 8]
export function readImportedTasks(): Task[] {[cite: 8]
  try {[cite: 8]
    if (!hasImportInUrl()) return [];[cite: 8]
    const json = decodeBase64Url(window.location.hash.slice(HASH_PREFIX.length));[cite: 8]
    const parsed: unknown = JSON.parse(json);[cite: 8]
    if (!Array.isArray(parsed)) return [];[cite: 8]

    const result: Task[] = [];[cite: 8]
    const now = Date.now();[cite: 8]
    for (const item of parsed.slice(0, MAX_IMPORTED_TASKS)) {[cite: 8]
      if (typeof item !== 'object' || item === null) continue;[cite: 8]
      const raw = item as Record<string, unknown>;[cite: 8]
      const title = typeof raw.t === 'string' ? raw.t.trim().slice(0, 200) : '';[cite: 8]
      if (!title || hasDuplicateTitle(result, title)) continue;[cite: 8]
      result.push({[cite: 8]
        id: `import-${now}-${result.length}`,[cite: 8]
        title,[cite: 8]
        completed: false,[cite: 8]
        createdAt: now - result.length,[cite: 8]
        category: isValidCategory(raw.c) ? raw.c : 'Other',[cite: 8]
        priority: isValidPriority(raw.p) ? raw.p : 'Medium',[cite: 8]
        dueDate: isValidDueDate(raw.d) ? raw.d : null,[cite: 8]
      });[cite: 8]
    }[cite: 8]
    return result;[cite: 8]
  } catch {[cite: 8]
    return [];[cite: 8]
  }[cite: 8]
}

export function mergeImportedTasks(base: Task[], imported: Task[]): Task[] {[cite: 8]
  const fresh = imported.filter((task) => !hasDuplicateTitle(base, task.title));[cite: 8]
  return [...fresh, ...base];[cite: 8]
}

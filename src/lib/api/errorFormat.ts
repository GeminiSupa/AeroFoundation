export function formatSupabaseError(err: unknown): string {
  if (!err) return 'Unknown error';
  if (err instanceof Error) return err.message || String(err);
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}


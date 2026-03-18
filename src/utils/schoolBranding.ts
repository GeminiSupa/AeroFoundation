const SCHOOL_LOGO_KEY = 'school-logo-url';
const SCHOOL_LOGO_PATH_KEY = 'school-logo-path';
export const SCHOOL_LOGO_CHANGED_EVENT = 'school-logo-changed';

export function getSchoolLogoUrl(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SCHOOL_LOGO_KEY);
}

export function getSchoolLogoPath(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SCHOOL_LOGO_PATH_KEY);
}

export function setSchoolLogoUrl(url: string | null): void {
  if (typeof window === 'undefined') return;
  if (url) localStorage.setItem(SCHOOL_LOGO_KEY, url);
  else localStorage.removeItem(SCHOOL_LOGO_KEY);
  window.dispatchEvent(new CustomEvent(SCHOOL_LOGO_CHANGED_EVENT));
}

export function setSchoolLogoPath(path: string | null): void {
  if (typeof window === 'undefined') return;
  if (path) localStorage.setItem(SCHOOL_LOGO_PATH_KEY, path);
  else localStorage.removeItem(SCHOOL_LOGO_PATH_KEY);
  window.dispatchEvent(new CustomEvent(SCHOOL_LOGO_CHANGED_EVENT));
}

const SCHOOL_LOGO_KEY = 'school-logo-url';
export const SCHOOL_LOGO_CHANGED_EVENT = 'school-logo-changed';

export function getSchoolLogoUrl(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SCHOOL_LOGO_KEY);
}

export function setSchoolLogoUrl(url: string | null): void {
  if (typeof window === 'undefined') return;
  if (url) localStorage.setItem(SCHOOL_LOGO_KEY, url);
  else localStorage.removeItem(SCHOOL_LOGO_KEY);
  window.dispatchEvent(new CustomEvent(SCHOOL_LOGO_CHANGED_EVENT));
}

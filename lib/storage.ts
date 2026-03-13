const CONTENT_KEY = 'md-editor-content'
const FILENAME_KEY = 'md-editor-filename'
const THEME_KEY = 'md-editor-theme'

export function loadContent(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(CONTENT_KEY) ?? ''
}

export function saveContent(raw: string): void {
  localStorage.setItem(CONTENT_KEY, raw)
}

export function loadFileName(): string {
  if (typeof window === 'undefined') return 'document.md'
  return localStorage.getItem(FILENAME_KEY) ?? 'document.md'
}

export function saveFileName(name: string): void {
  localStorage.setItem(FILENAME_KEY, name)
}

export function loadTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') ?? 'light'
}

export function saveTheme(theme: 'light' | 'dark'): void {
  localStorage.setItem(THEME_KEY, theme)
}

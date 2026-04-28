export const SOCIAL_WEBVIEW_CLASS = "is-social-webview";

export function isSocialWebView(userAgent: string) {
  return /micromessenger|\bqq\//i.test(userAgent);
}

export function applyBrowserChromeClass(root: HTMLElement, userAgent: string) {
  root.classList.toggle(SOCIAL_WEBVIEW_CLASS, isSocialWebView(userAgent));
}

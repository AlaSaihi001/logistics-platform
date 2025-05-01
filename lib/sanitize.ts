import sanitizeHtmlLibrary from "sanitize-html";

export function sanitizeHtml(input: string): string {
  return sanitizeHtmlLibrary(input, {
    allowedTags: [],        // لا يسمح بأي HTML
    allowedAttributes: {},  // لا يسمح بأي attributes
  });
}

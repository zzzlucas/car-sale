function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function isSafeHref(href: string) {
  return /^(https?:\/\/|\/|tel:|mailto:)/i.test(href.trim());
}

function renderInlineMarkdown(text: string) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, (_match, label: string, href: string) => {
      const normalizedHref = String(href || "").trim();
      if (!isSafeHref(normalizedHref)) {
        return label;
      }

      return `<a href="${escapeAttribute(normalizedHref)}">${label}</a>`;
    });
}

function flushParagraph(paragraphLines: string[], output: string[]) {
  if (paragraphLines.length === 0) {
    return;
  }

  output.push(`<p>${renderInlineMarkdown(paragraphLines.join("\n")).replace(/\n/g, "<br>")}</p>`);
  paragraphLines.length = 0;
}

function flushList(listItems: string[], output: string[]) {
  if (listItems.length === 0) {
    return;
  }

  output.push(`<ul>${listItems.map(item => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`);
  listItems.length = 0;
}

export function renderSupportMarkdown(markdown: string) {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const output: string[] = [];
  const paragraphLines: string[] = [];
  const listItems: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph(paragraphLines, output);
      flushList(listItems, output);
      continue;
    }

    const listMatch = line.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      flushParagraph(paragraphLines, output);
      listItems.push(listMatch[1]);
      continue;
    }

    flushList(listItems, output);
    paragraphLines.push(line);
  }

  flushParagraph(paragraphLines, output);
  flushList(listItems, output);

  return output.join("");
}

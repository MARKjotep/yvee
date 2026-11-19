export interface RenderedContent {
  html: string;
  commit?: () => void | Promise<void>;
}

export type ContentRenderer = (
  value: unknown,
  parentId?: string,
) => RenderedContent | Promise<RenderedContent>;

let renderer: ContentRenderer | undefined;

export const setContentRenderer = (next: ContentRenderer) => {
  renderer = next;
  return () => {
    if (renderer === next) renderer = undefined;
  };
};

export const renderContent = async (
  value: unknown,
  parentId?: string,
): Promise<RenderedContent> => {
  if (renderer) return renderer(value, parentId);

  const text = value == null ? "" : String(value);
  const html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
  return { html };
};

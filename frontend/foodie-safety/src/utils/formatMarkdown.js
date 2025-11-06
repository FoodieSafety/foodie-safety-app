import { marked } from "marked";
import DOMPurify from "dompurify";

export const formatMarkdown = (text) => {
  const rawHtml = marked(text, {
    breaks: true,
    gfm: true
  });

  return DOMPurify.sanitize(rawHtml);
};
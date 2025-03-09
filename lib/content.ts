import { JSONContent } from "novel";

export const defaultEditorContent: JSONContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "New note" }]
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: "Start typing here..." }]
    }
  ]
}; 
export type NoteContent = {
  title?: string;
  wordCount?: number;
  htmlContent?: string;
  markdownContent?: string;
  jsonContent?: any;
  images?: any[];
};

export type FileItem = {
  id?: string;
  name: string;
  date: string;
  type: string;
  description: string;
  tags: string[];
  url?: string;
  content?: string | NoteContent;
}; 
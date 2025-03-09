'use client';

import { NoteLayout } from '../app/NoteLayout';
import { FileItem } from '../app/types';
import { AlertCircle } from 'lucide-react';

interface NotePreviewProps {
  file: FileItem;
  onEdit?: () => void;
}

export default function NotePreview({ file, onEdit }: NotePreviewProps) {
  if (!file.content) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
        <p className="text-lg font-medium text-red-700">Note content is missing</p>
        <p className="text-sm text-red-500 mt-1">The note content is required to preview the note</p>
      </div>
    );
  }

  return (
    <NoteLayout
      title={file.name}
      date={file.date}
      tags={file.tags}
      isEditing={false}
      file={file}
      onEdit={onEdit}
    >
      <div className="p-4">
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap font-sans">{file.content?.markdownContent}</pre>
        </div>
      </div>
    </NoteLayout>
  );
} 
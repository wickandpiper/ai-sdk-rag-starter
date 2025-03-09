'use client';

import { NoteLayout } from '../app/NoteLayout';
import { FileItem } from '../app/types';
import { AlertCircle } from 'lucide-react';
import TailwindAdvancedEditor from '../ui/Editor/editor';
import { useState, useEffect } from 'react';

interface NotePreviewProps {
  file: FileItem;
  onEdit?: () => void;
}

export default function NotePreview({ file, onEdit }: NotePreviewProps) {
  const [parsedContent, setParsedContent] = useState<any>(null);
  
  useEffect(() => {
    console.log("NotePreview: file changed", file.id || file.name);
    // Parse the content if it's available
    if (file.content) {
      try {
        // If content is a string, try to parse it as JSON
        if (typeof file.content === 'string') {
          try {
            const parsed = JSON.parse(file.content);
            setParsedContent(parsed);
          } catch (e) {
            // If it's not valid JSON, just use it as plain text
            setParsedContent(null);
          }
        } else {
          // If content is already an object, use it directly
          setParsedContent(file.content);
        }
      } catch (error) {
        console.error("Error parsing content:", error);
        setParsedContent(null);
      }
    }
  // Add file.id, file.name, and file.date to ensure the effect runs when the file changes
  }, [file.id, file.name, file.date, file.content]);
  
  if (!file.content) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
        <p className="text-lg font-medium text-red-700">Note content is missing</p>
        <p className="text-sm text-red-500 mt-1">The note content is required to preview the note</p>
      </div>
    );
  }

  // Determine content to display based on content type
  let contentToDisplay = '';
  if (typeof file.content === 'string') {
    contentToDisplay = file.content;
  } else {
    // Use type assertion to tell TypeScript this is an object with markdownContent
    const contentObj = file.content as any;
    contentToDisplay = contentObj.markdownContent || '';
  }

  // Check if we have valid JSON content for the editor
  const hasEditorContent = parsedContent && 
    (parsedContent.jsonContent || 
     (parsedContent.type === 'doc' && parsedContent.content));

  // If we have jsonContent directly, use it, otherwise check if the content itself is a valid editor document
  const editorContent = parsedContent?.jsonContent || 
    (parsedContent?.type === 'doc' ? parsedContent : null);

  return (
    <NoteLayout
      title={file.name}
      date={file.date}
      tags={file.tags}
      isEditing={false}
      file={file}
      onEdit={onEdit}
    >
      <div className="p-4 h-full">
        {hasEditorContent ? (
          <TailwindAdvancedEditor 
            key={`note-${file.id || file.name}-${Date.now()}`}
            title={file.name}
            initialResourceId={file.id}
            readOnly={true}
            initialContent={editorContent}
          />
        ) : (
          <div 
            key={`text-${file.id || file.name}-${Date.now()}`} 
            className="prose prose-sm max-w-none"
          >
            <pre className="whitespace-pre-wrap font-sans">{contentToDisplay}</pre>
          </div>
        )}
      </div>
    </NoteLayout>
  );
} 
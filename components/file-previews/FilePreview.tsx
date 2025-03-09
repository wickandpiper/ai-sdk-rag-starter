'use client';

import { useState } from 'react';
import PDFPreview from './PDFPreview';
import DOCXPreview from './DOCXPreview';
import XLSXPreview from './XLSXPreview';
import PPTXPreview from './PPTXPreview';
import ImagePreview from './ImagePreview';
import NotePreview from './NotePreview';
import { ActionHeader } from './ActionHeader';
import { 
  AlertCircle,
  FileText
} from 'lucide-react';
import { FileItem } from '../app/types';

interface FilePreviewProps {
  file: FileItem;
  onEditNote?: () => void;
}

export default function FilePreview({ file, onEditNote }: FilePreviewProps) {
  const [error, setError] = useState<string | null>(null);

  // Render the appropriate preview component based on file type
  const renderFilePreview = () => {
    try {
      // Handle note type
      if (file.type === 'note') {
        return <NotePreview file={file} onEdit={onEditNote} />;
      }

      // Handle other file types that require URL
      if (!file.url) {
        return (
          <div className="flex flex-col items-center justify-center p-12">
            <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
            <p className="text-lg font-medium text-red-700">File URL is missing</p>
            <p className="text-sm text-red-500 mt-1">The file URL is required to preview the file</p>
          </div>
        );
      }

      switch (file.type) {
        case 'pdf':
          return <PDFPreview url={file.url} />;
        case 'docx':
          return <DOCXPreview url={file.url} />;
        case 'xlsx':
          return <XLSXPreview url={file.url} />;
        case 'pptx':
          return <PPTXPreview url={file.url} title={file.name} />;
        case 'png':
        case 'jpg':
        case 'jpeg':
          return <ImagePreview url={file.url} alt={file.name} />;
        default:
          return (
            <div className="flex flex-col items-center justify-center p-12">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700">No preview available</p>
              <p className="text-sm text-gray-500 mt-1">This file type cannot be previewed</p>
              {file.url && (
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                >
                  Download File
                </a>
              )}
            </div>
          );
      }
    } catch (err) {
      console.error('Error rendering file preview:', err);
      setError('Failed to render file preview');
      return (
        <div className="flex flex-col items-center justify-center p-12">
          <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
          <p className="text-lg font-medium text-red-700">Error previewing file</p>
          <p className="text-sm text-red-500 mt-1">{error || 'An unexpected error occurred'}</p>
        </div>
      );
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Only show ActionHeader for non-note file types */}
      {file.type !== 'note' && (
        <ActionHeader file={file} onEdit={file.type === 'note' ? onEditNote : undefined} />
      )}
      
      {/* File preview content */}
      <div className="flex-1 overflow-y-auto">
        {renderFilePreview()}
      </div>
    </div>
  );
} 
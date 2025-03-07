'use client';

import { useState } from 'react';
import PDFPreview from './PDFPreview';
import DOCXPreview from './DOCXPreview';
import XLSXPreview from './XLSXPreview';
import PPTXPreview from './PPTXPreview';
import ImagePreview from './ImagePreview';
import { 
  FileText, 
  FileImage, 
  FileSpreadsheet, 
  File as FileIcon, 
  Presentation as PresentationIcon,
  AlertCircle
} from 'lucide-react';

interface FilePreviewProps {
  file: {
    name: string;
    type: string;
    url: string;
  };
}

export default function FilePreview({ file }: FilePreviewProps) {
  const [error, setError] = useState<string | null>(null);

  // Render the appropriate preview component based on file type
  const renderFilePreview = () => {
    try {
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
              <a 
                href={file.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
              >
                Download File
              </a>
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

  // Render file icon based on file type
  const renderFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileIcon className="h-5 w-5 text-red-600" />;
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'xlsx':
        return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
      case 'pptx':
        return <PresentationIcon className="h-5 w-5 text-orange-600" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
        return <FileImage className="h-5 w-5 text-purple-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="w-full">
      {renderFilePreview()}
    </div>
  );
} 
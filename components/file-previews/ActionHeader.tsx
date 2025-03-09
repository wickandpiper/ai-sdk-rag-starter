'use client';

import { useState } from 'react';
import { Download, Copy, Edit, FileText, FileImage, File, FileSpreadsheet, Presentation, StickyNote, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileItem } from '../app/types';
import { useRouter } from 'next/navigation';

interface ActionHeaderProps {
  file: FileItem;
  onEdit?: () => void;
}

export function ActionHeader({ file, onEdit }: ActionHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'note':
        return <StickyNote className="h-5 w-5 text-yellow-600" />;
      case 'pdf':
        return <File className="h-5 w-5 text-red-600" />;
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'xlsx':
        return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
      case 'pptx':
        return <Presentation className="h-5 w-5 text-orange-600" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
        return <FileImage className="h-5 w-5 text-purple-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleCopyContent = async () => {
    try {
      if (file.content) {
        await navigator.clipboard.writeText(file.content);
        setCopied(true);
        toast.success('Content copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } else if (file.url) {
        await navigator.clipboard.writeText(file.url);
        setCopied(true);
        toast.success('File URL copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy content');
    }
  };

  const handleDownload = () => {
    try {
      if (file.type === 'note' && file.content) {
        // Download note as text file
        const element = document.createElement('a');
        const fileBlob = new Blob([file.content], { type: 'text/plain' });
        element.href = URL.createObjectURL(fileBlob);
        element.download = `${file.name}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success('Note downloaded successfully');
      } else if (file.url) {
        // Download other file types directly from URL
        const element = document.createElement('a');
        element.href = file.url;
        element.download = file.name;
        element.target = '_blank';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success('File download started');
      } else {
        toast.error('No file content or URL available for download');
      }
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download file');
    }
  };

  const handleEditNote = () => {
    if (file.type === 'note') {
      setIsLoading(true);
      
      // Show loading toast
      toast.promise(
        new Promise((resolve) => {
          // Extract note ID from the file or use the name as ID
          const noteId = file.id || file.name.replace(/\s+/g, '-').toLowerCase();
          
          // Clear any cached note data from localStorage
          localStorage.removeItem(`note-content-${noteId}`);
          localStorage.removeItem(`note-metadata-${noteId}`);
          
          // Navigate to the note editor page
          router.push(`/notes/${noteId}`);
          
          // Also call the onEdit callback if provided
          if (onEdit) {
            onEdit();
          }
          
          // Resolve the promise after a short delay to show the loading state
          setTimeout(() => {
            setIsLoading(false);
            resolve(true);
          }, 500);
        }),
        {
          loading: 'Opening note editor...',
          success: 'Note editor opened successfully',
          error: 'Failed to open note editor'
        }
      );
    }
  };

  return (
    <div className="flex justify-between items-center p-4 border-b border-purple-100">
      <div className="flex items-center space-x-3">
        {getFileIcon(file.type)}
        <div>
          <h2 className="text-lg font-semibold text-purple-800">{file.name}</h2>
          <p className="text-xs text-gray-500">Last updated: {file.date}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        {/* Copy button - show for all file types */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCopyContent}
          className="text-xs"
          disabled={!file.content && !file.url}
        >
          <Copy className="h-3.5 w-3.5 mr-1" />
          {copied ? 'Copied' : 'Copy'}
        </Button>
        
        {/* Download button - show for all file types */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
          className="text-xs"
          disabled={!file.content && !file.url}
        >
          <Download className="h-3.5 w-3.5 mr-1" />
          Download
        </Button>
        
        {/* Edit button - only show for notes */}
        {file.type === 'note' && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleEditNote}
            className="text-xs bg-purple-600 hover:bg-purple-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Edit className="h-3.5 w-3.5 mr-1" />
                Edit
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
} 
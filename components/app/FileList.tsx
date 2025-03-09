import { useState } from 'react';
import { Grid, List, FileText } from 'lucide-react';
import { FileListItem } from './FileListItem';
import { FileCard } from './FileCard';
import { FileItem } from './types';
import FilePreview from '../file-previews/FilePreview';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

type FileListProps = {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  filteredFiles: FileItem[];
  getFileIcon: (fileType: string) => JSX.Element;
  onEditNote?: (file: FileItem) => void;
  hasMoreNotes?: boolean;
  isLoadingNotes?: boolean;
  onLoadMoreNotes?: () => void;
};

export function FileList({ 
  viewMode, 
  setViewMode, 
  filteredFiles, 
  getFileIcon, 
  onEditNote,
  hasMoreNotes = false,
  isLoadingNotes = false,
  onLoadMoreNotes
}: FileListProps) {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  console.log("selectedFile", selectedFile)

  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file);
    console.log("Selected file with ID:", file.id || "No ID available");
  };

  const handleEditNote = () => {
    if (selectedFile && selectedFile.type === 'note' && !isNavigating) {
      setIsNavigating(true);
      
      // Show loading toast
      toast.loading('Opening note editor...', {
        id: 'note-loading',
        duration: 2000
      });
      
      // Clear any cached note data from localStorage
      const noteId = selectedFile.id || selectedFile.name.replace(/\s+/g, '-').toLowerCase();
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`note-content-${noteId}`);
        localStorage.removeItem(`note-metadata-${noteId}`);
        localStorage.removeItem('novel-content');
      }
      
      // If onEditNote callback is provided, use it
      if (onEditNote) {
        onEditNote(selectedFile);
        setIsNavigating(false);
      } else {
        // Otherwise, navigate directly to the note editor
        setTimeout(() => {
          router.push(`/notes/${noteId}`);
          setIsNavigating(false);
        }, 100);
      }
    }
  };

  return (
    <div className="flex w-full h-full">
      <div className="w-1/3 bg-white/80 backdrop-blur-sm p-4 overflow-y-auto border-r border-purple-100 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-purple-800">Files</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-purple-100 text-purple-700' : 'bg-white text-gray-500'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-purple-100 text-purple-700' : 'bg-white text-gray-500'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="flex-grow">
          {viewMode === 'list' ? (
            <div className="space-y-2">
              {filteredFiles.map((file, index) => (
                <FileListItem 
                  key={uuidv4()} 
                  file={file} 
                  getFileIcon={getFileIcon} 
                  onFileSelect={handleFileSelect}
                  isSelected={
                    (selectedFile?.id && file.id) 
                      ? selectedFile.id === file.id 
                      : selectedFile?.name === file.name && selectedFile?.date === file.date
                  }
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredFiles.map((file, index) => (
                <FileCard 
                  key={uuidv4()}
                  file={file} 
                  getFileIcon={getFileIcon} 
                  onFileSelect={handleFileSelect}
                  isSelected={
                    (selectedFile?.id && file.id) 
                      ? selectedFile.id === file.id 
                      : selectedFile?.name === file.name && selectedFile?.date === file.date
                  }
                />
              ))}
            </div>
          )}
          
          {filteredFiles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-purple-300 mb-4" />
              <p className="text-purple-500 text-lg">No files found</p>
              <p className="text-purple-400 text-sm mt-1">Try changing your filters or upload a new file</p>
            </div>
          )}
        </div>
        
        {/* Load more notes button */}
        {hasMoreNotes && (
          <div className="mt-4 flex justify-center">
            <button 
              onClick={onLoadMoreNotes}
              disabled={isLoadingNotes}
              className="bg-purple-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed w-full text-center"
            >
              {isLoadingNotes ? 'Loading...' : 'Load more notes'}
            </button>
          </div>
        )}
      </div>

      {/* Preview Panel */}
      <div className="w-2/3 h-full bg-gray-50">
        {selectedFile ? (
          <FilePreview 
            file={selectedFile} 
            onEditNote={handleEditNote}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No file selected</p>
            <p className="text-gray-400 text-sm mt-1">Select a file to preview its contents</p>
          </div>
        )}
      </div>
    </div>
  );
} 
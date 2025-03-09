import { Grid, List, FileText } from 'lucide-react';
import { FileListItem } from './FileListItem';
import { FileCard } from './FileCard';
import { FileItem } from './types';

type FileListProps = {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  filteredFiles: FileItem[];
  getFileIcon: (fileType: string) => JSX.Element;
};

export function FileList({ viewMode, setViewMode, filteredFiles, getFileIcon }: FileListProps) {
  return (
    <div className="w-1/3 bg-white/80 backdrop-blur-sm p-4 overflow-y-auto border-r border-purple-100">
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
      
      {viewMode === 'list' ? (
        <div className="space-y-2">
          {filteredFiles.map((file) => (
            <FileListItem key={file.name} file={file} getFileIcon={getFileIcon} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredFiles.map((file) => (
            <FileCard key={file.name} file={file} getFileIcon={getFileIcon} />
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
  );
} 
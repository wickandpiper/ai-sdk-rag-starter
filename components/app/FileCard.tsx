import { Card } from '@/components/ui/card';
import { FileItem } from './types';

type FileCardProps = {
  file: FileItem;
  getFileIcon: (fileType: string) => JSX.Element;
  onFileSelect: (file: FileItem) => void;
  isSelected?: boolean;
};

export function FileCard({ file, getFileIcon, onFileSelect, isSelected = false }: FileCardProps) {
  return (
    <Card 
      className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
        isSelected ? 'ring-2 ring-purple-400 shadow-md' : ''
      }`}
      onClick={() => onFileSelect(file)}
    >
      <div className="p-3 border-b border-purple-100">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            {getFileIcon(file.type)}
            <div className="truncate font-medium text-sm text-purple-800">{file.name}</div>
          </div>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{file.description}</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {file.tags?.slice(0, 1).map(tag => (
            <span key={tag} className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        <div className="text-xs text-purple-500">{file.date}</div>
      </div>
    </Card>
  );
} 
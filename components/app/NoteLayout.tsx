import { ReactNode } from 'react';
import { ActionHeader } from '../file-previews/ActionHeader';
import { FileItem } from './types';

interface NoteLayoutProps {
  title: string;
  date?: string;
  tags?: string[];
  children: ReactNode;
  isEditing?: boolean;
  file?: FileItem;
  onEdit?: () => void;
  customHeader?: ReactNode;
}

export function NoteLayout({ 
  title, 
  date, 
  tags, 
  children, 
  isEditing = false,
  file,
  onEdit,
  customHeader
}: NoteLayoutProps) {
  return (
    <div className={`flex flex-col h-full ${isEditing ? 'bg-white' : 'bg-white rounded-md shadow-sm'}`}>
      {/* Header */}
      {customHeader ? (
        customHeader
      ) : file ? (
        <ActionHeader file={file} onEdit={onEdit} />
      ) : null}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="px-4 py-2 border-b border-purple-100">
          <div className="flex flex-wrap gap-1">
            {tags.map(tag => (
              <span 
                key={tag} 
                className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
} 
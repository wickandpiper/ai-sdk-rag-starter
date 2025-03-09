import { FileItem } from './types';

type FileListItemProps = {
  file: FileItem;
  getFileIcon: (fileType: string) => JSX.Element;
};

export function FileListItem({ file, getFileIcon }: FileListItemProps) {
  return (
    <div 
      className="flex items-center p-2 hover:bg-purple-50 rounded-md cursor-pointer"
    >
      <div className="mr-3">
        {getFileIcon(file.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-purple-800 truncate">{file.name}</div>
        <div className="text-xs text-gray-500 truncate">{file.description}</div>
        <div className="flex items-center mt-1">
          <span className="text-xs text-purple-500 mr-2">{file.date}</span>
          <div className="flex flex-wrap gap-1">
            {file.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
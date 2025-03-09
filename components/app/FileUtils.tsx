import { FileIcon, FileText, FileImage, FileSpreadsheet, PresentationIcon } from 'lucide-react';

// Get file icon based on file type
export const getFileIcon = (fileType: string) => {
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Plus, ChevronDown, Search } from 'lucide-react';
import { ProjectSelector } from './ProjectSelector';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { FileItem } from './types';

type HeaderProps = {
  currentProject: string;
  setCurrentProject: (project: string) => void;
  fileSearchQuery: string;
  setFileSearchQuery: (query: string) => void;
  setFiles: (files: FileList | undefined) => void;
  setSelectedFile: (file: FileItem | null) => void;
  setRecentFiles: (files: FileItem[] | ((prev: FileItem[]) => FileItem[])) => void;
  setIsUploading: (isUploading: boolean) => void;
};

export function Header({
  currentProject,
  setCurrentProject,
  fileSearchQuery,
  setFileSearchQuery,
  setFiles,
  setSelectedFile,
  setRecentFiles,
  setIsUploading
}: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const projects = [
    "Default Project",
    "VM02",
    "Design System",
    "User Research",
    "Prototype"
  ];

  const filteredProjects = projects.filter(project => 
    project.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="flex items-center space-x-4">
        <ProjectSelector 
          currentProject={currentProject}
          setCurrentProject={setCurrentProject}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredProjects={filteredProjects}
        />
      </div>
      <div className="flex space-x-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
          <Input 
            placeholder="Search files..." 
            value={fileSearchQuery}
            onChange={(e) => setFileSearchQuery(e.target.value)}
            className="pl-10 h-9 text-sm focus-visible:ring-purple-400 w-64"
          />
        </div>
        
        <Button 
          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
        
        <Button 
          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
        >
          <Upload className="h-4 w-4" />
          <span>Upload</span>
        </Button>
        
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          accept=".pdf,.docx,.txt,.pptx,.xlsx,.png,.jpg,.jpeg"
          onChange={async (e) => {
            if (e.target.files?.length) {
              const file = e.target.files[0];
              setIsUploading(true);
              
              try {
                const fileExt = file.name.split('.').pop() || '';
                const newFile: FileItem = {
                  name: file.name,
                  date: new Date().toISOString().split('T')[0],
                  type: fileExt,
                  description: `Uploaded file: ${file.name}`,
                  tags: ["uploaded"]
                };
                setRecentFiles(prev => [newFile, ...prev]);
                setFiles(e.target.files);
                setSelectedFile(newFile);
                toast.success('File selected successfully');
              } catch (error) {
                console.error('Error handling file:', error);
                toast.error('Error handling file. Please try again.');
              } finally {
                setIsUploading(false);
              }
            }
          }}
        />
      </div>
    </header>
  );
} 
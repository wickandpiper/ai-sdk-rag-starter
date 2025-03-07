'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import * as Popover from '@radix-ui/react-popover';
import { toast } from 'sonner';
import { 
  Plus, FileText, Upload, Paperclip, ChevronsUpDown, Menu, X, Search, 
  Folder, Loader2, ChevronDown, File as FileIcon, FileImage, FileSpreadsheet, 
  Presentation as PresentationIcon, Filter, SortAsc, Calendar, Grid, List,
  Save, ArrowLeft, Users, MessageSquare, Palette, ListOrdered
} from 'lucide-react';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    maxSteps: 3,
  });

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentProject, setCurrentProject] = useState("Default Project");
  const [searchQuery, setSearchQuery] = useState("");
  const [fileFilter, setFileFilter] = useState("all");
  const [fileSortBy, setFileSortBy] = useState("date");
  const [fileSearchQuery, setFileSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Define the file type
  type FileItem = {
    name: string;
    date: string;
    type: string;
    description: string;
    tags: string[];
    url?: string;
  };

  const [recentFiles, setRecentFiles] = useState<FileItem[]>([
    { name: "YIT Construction.pdf", date: "2024-02-24", type: "pdf", description: "User research findings from interviews with 10 participants", tags: ["research", "user-testing"], url: "/sample-files/30d54b9e-03ba-4cdb-8ad4-41332d47073bYITPlatform.pdf" },
    { name: "Research Notes.pdf", date: "2024-02-24", type: "pdf", description: "User research findings from interviews with 10 participants", tags: ["research", "user-testing"], url: "/sample-files/sample-pdf.pdf" },
    { name: "User Interviews.docx", date: "2024-02-23", type: "docx", description: "Transcripts from user interviews conducted in February", tags: ["research", "interviews"], url: "/sample-files/sample-word.docx" },
    { name: "Design Brief.pdf", date: "2024-02-22", type: "pdf", description: "Project requirements and design specifications", tags: ["design", "requirements"], url: "/sample-files/sample-pdf.pdf" },
    { name: "Persona Template.pptx", date: "2024-02-21", type: "pptx", description: "Template for creating user personas", tags: ["templates", "personas"], url: "/sample-files/sample-powerpoint.pptx" },
  ]);

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

  const filteredFiles = recentFiles
    .filter(file => 
      (fileFilter === "all" || file.type === fileFilter) &&
      (file.name.toLowerCase().includes(fileSearchQuery.toLowerCase()) ||
       (file.description && file.description.toLowerCase().includes(fileSearchQuery.toLowerCase())))
    )
    .sort((a, b) => {
      if (fileSortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (fileSortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (fileSortBy === "type") {
        return a.type.localeCompare(b.type);
      }
      return 0;
    });

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300">
      <header className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="flex items-center space-x-4">
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className="flex items-center space-x-2 text-base font-medium text-purple-700 bg-white/80 px-3 py-1.5 rounded-lg shadow-sm hover:bg-white/90 transition-colors">
                <ChevronsUpDown className="h-3.5 w-3.5" />
                <span>{currentProject}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content 
                className="z-50 w-[220px] rounded-md border bg-white shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2" 
                sideOffset={4}
              >
                <div className="p-1.5 border-b">
                  <Input 
                    placeholder="Search projects..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-7 text-xs focus-visible:ring-purple-400"
                  />
                </div>
                <div className="max-h-[200px] overflow-y-auto p-1.5">
                  {filteredProjects.map((project) => (
                    <button
                      key={project}
                      onClick={() => {
                        setCurrentProject(project);
                        setSearchQuery("");
                      }}
                      className={`w-full text-left px-2 py-1 text-xs rounded-sm hover:bg-purple-50 hover:text-purple-700 transition-colors ${
                        currentProject === project ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                      }`}
                    >
                      {project}
                    </button>
                  ))}
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
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
          
          <Popover.Root>
            <Popover.Trigger asChild>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content 
                className="bg-white rounded-lg shadow-lg p-2 w-48"
                sideOffset={5}
              >
                <div className="flex flex-col">
                  <a 
                    href="/notes/new" 
                    className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>New Note</span>
                  </a>
                </div>
                <Popover.Arrow className="fill-white" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          
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
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left column - Files */}
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
                <div 
                  key={file.name}
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
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredFiles.map((file) => (
                <Card key={file.name} className="overflow-hidden hover:shadow-lg transition-shadow">
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
        
        {/* Right column - Chat */}
        <div className="w-2/3 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="w-full max-w-3xl mx-auto space-y-4">
              {messages.map(m => (
                <div 
                  key={m.id} 
                  className={`whitespace-pre-wrap bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm ${m.content ? 'animate-fade-in' : 'hidden'}`}
                >
                  <div className="font-semibold text-purple-700 mb-2">{m.role === 'assistant' ? 'Chip' : 'You'}</div>
                  <div className="text-purple-900">
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && !messages[messages.length - 1]?.content && (
                <div className="flex justify-center items-center p-4 animate-fade-in">
                  <Loader2 className="w-6 h-6 text-purple-700 animate-spin" />
                </div>
              )}
            </div>
          </div>
          
          <div className="p-4 border-t border-purple-100 bg-white/80 backdrop-blur-sm">
            <form 
              onSubmit={event => {
                handleSubmit(event, {
                  experimental_attachments: files,
                });
                setFiles(undefined);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }} 
              className="w-full max-w-3xl mx-auto"
            >
              <div className="flex items-center space-x-4">
                <div className="relative flex-grow">
                  <div className="relative">
                    {selectedFile && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center bg-purple-100 rounded-full pl-2 pr-1 py-0.5">
                        <FileText className="h-3 w-3 text-purple-700 mr-1" />
                        <span className="text-xs text-purple-700 mr-1">{selectedFile.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setFiles(undefined);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="hover:bg-purple-200 rounded-full p-0.5 text-purple-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    <Input 
                      placeholder="Let's get creating..." 
                      onChange={handleInputChange} 
                      value={input}
                      className={`flex-grow bg-purple-50 border border-purple-200 text-purple-700 placeholder:text-purple-400 focus:border-purple-400 focus-visible:ring-purple-400 focus:ring-purple-400 pr-10 ${
                        selectedFile ? 'pl-[calc(0.5rem+var(--badge-width))]' : ''
                      }`}
                      style={{ '--badge-width': selectedFile ? `${selectedFile.name.length * 6 + 50}px` : '0px' } as React.CSSProperties}
                    />
                  </div>
                  <Popover.Root>
                    <Popover.Trigger asChild>
                      <button 
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-purple-100 text-purple-700 transition-colors"
                      >
                        <Paperclip className="h-4 w-4" />
                      </button>
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content 
                        className="z-[100] w-[280px] rounded-md border bg-white shadow-md outline-none" 
                        sideOffset={5}
                        align="end"
                      >
                        <div className="p-2 border-b">
                          <div className="text-xs font-medium text-gray-500 mb-2">Recent Files</div>
                          <div className="space-y-1">
                            {recentFiles.slice(0, 3).map((file) => (
                              <Popover.Close key={file.name} asChild>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedFile(file);
                                  }}
                                  className="w-full flex items-center space-x-2 px-2 py-1.5 text-xs rounded-sm hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition-colors"
                                >
                                  <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span className="truncate">{file.name}</span>
                                  <span className="text-gray-400 text-[10px] ml-auto flex-shrink-0">{file.date}</span>
                                </button>
                              </Popover.Close>
                            ))}
                          </div>
                        </div>
                        <div className="p-2">
                          <Popover.Close asChild>
                            <label 
                              className="flex items-center justify-center space-x-2 px-2 py-1.5 text-xs rounded-sm bg-purple-50 hover:bg-purple-100 text-purple-700 cursor-pointer transition-colors w-full"
                            >
                              <Upload className="h-3.5 w-3.5" />
                              <span>Upload New File</span>
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.docx,.txt"
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
                            </label>
                          </Popover.Close>
                        </div>
                        <Popover.Arrow className="fill-white" />
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                </div>
                <Button type="submit" size="icon" className="bg-purple-500 hover:bg-purple-600 text-white">
                  ➔
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import * as Popover from '@radix-ui/react-popover';
import Typewriter from 'typewriter-effect';
import { toast } from 'sonner';
import { Plus, FileText, Upload, Paperclip, ChevronsUpDown, Menu, X, Search, Folder, Loader2, ChevronDown } from 'lucide-react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    maxSteps: 3,
  });

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<{ name: string; date: string; url?: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentProject, setCurrentProject] = useState("Default Project");
  const [searchQuery, setSearchQuery] = useState("");
  const [recentFiles, setRecentFiles] = useState([
    { name: "Research Notes.pdf", date: "2024-02-24" },
    { name: "User Interviews.docx", date: "2024-02-23" },
    { name: "Design Brief.pdf", date: "2024-02-22" },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300">
      <header className="flex justify-between items-center p-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => setDrawerOpen(!isDrawerOpen)} className="text-purple-700">
            <Menu className="h-5 w-5" />
          </button>
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
          <button className="text-purple-700">
            <Folder className="h-5 w-5" />
          </button>
        </div>
      </header>
      {isDrawerOpen && (
        <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg p-4">
          <button onClick={() => setDrawerOpen(false)} className="text-purple-700 mb-4">
            <X className="h-5 w-5" />
          </button>
          <nav className="space-y-2">
            <a href="#" className="block text-purple-700">Dashboard</a>
            <a href="#" className="block text-purple-700">Chats</a>
            <a href="#" className="block text-purple-700">Files</a>
            <a href="#" className="block text-purple-700">Tags</a>
            <a href="#" className="block text-purple-700">Highlights</a>
            <a href="#" className="block text-purple-700">Links</a>
            <a href="#" className="block text-purple-700">Pinned</a>
            <a href="#" className="block text-purple-700">Recent</a>
            <a href="#" className="block text-purple-700">Bin</a>
            <a href="#" className="block text-purple-700">Published</a>
            <a href="#" className="block text-purple-700">Guides & Tutorials</a>
          </nav>
        </aside>
      )}
      <main className="flex flex-col items-center min-h-screen pb-32 relative">
        <div className="w-full max-w-2xl space-y-4 mb-4 px-4 pt-4 pb-48">
          {messages.map(m => (
            <div 
              key={m.id} 
              className={`whitespace-pre-wrap bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm ${m.content ? 'animate-fade-in' : 'hidden'}`}
            >
              <div className="font-semibold text-purple-700 mb-2">{m.role === 'assistant' ? 'Chip' : 'You'}</div>
              <div className="text-purple-900">
                {m.content}
              </div>
              {m?.experimental_attachments?.map((attachment, index) => (
                attachment.contentType?.startsWith('image/') ? (
                  <div key={`${m.id}-${index}`} className="mt-3">
                    <Image
                      src={attachment.url}
                      width={500}
                      height={500}
                      alt={attachment.name ?? `attachment-${index}`}
                      loading="lazy"
                    />
                  </div>
                ) : null
              ))}
            </div>
          ))}
          {isLoading && !messages[messages.length - 1]?.content && (
            <div className="flex justify-center items-center p-4 animate-fade-in">
              <Loader2 className="w-6 h-6 text-purple-700 animate-spin" />
            </div>
          )}
        </div>
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl z-10 space-y-4 bg-transparent">
          {showWelcome && (
            <div className="text-2xl font-light text-purple-700 text-center">
              <Typewriter
                options={{
                  strings: [
                    "Hey Tony, I'm Chip. Your Experience Design Assistant.",
                    "Let's create something amazing together!",
                    "Need help? I'm here to assist you.",
                  ],
                  autoStart: true,
                  loop: false,
                  delay: 50,
                  deleteSpeed: 30,
                  cursor: "",
                }}
              />
            </div>
          )}
          <form 
            onSubmit={event => {
              console.log("Submitted");
              setShowWelcome(false);
              handleSubmit(event, {
                experimental_attachments: files,
              });

              setFiles(undefined);

              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }} 
            className="bg-white shadow-md rounded-lg p-6"
          >
            <div className="flex items-center space-x-4 mb-4">
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
                      <Plus className="h-4 w-4" />
                    </button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content 
                      className="z-[100] w-[280px] rounded-md border bg-white shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=top]:slide-in-from-bottom-2" 
                      sideOffset={5}
                      align="end"
                    >
                      <div className="p-2 border-b">
                        <div className="text-xs font-medium text-gray-500 mb-2">Recent Files</div>
                        <div className="space-y-1">
                          {recentFiles.map((file) => (
                            <Popover.Close key={file.name} asChild>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedFile(file);
                                  // You might want to handle actual file selection here
                                  console.log("Selected file:", file.name);
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
                                    // Simplified file handling
                                    const newFile = {
                                      name: file.name,
                                      date: new Date().toISOString().split('T')[0]
                                    };
                                    setRecentFiles(prev => [newFile, ...prev.slice(0, 2)]);
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
            <div className="px-4">
              <div className="flex flex-wrap gap-2">
                {["Summarise document", "Identify tags", "Create persona", "Create journey", "Create navigation"].map((text) => (
                  <Button 
                    key={text} 
                    variant="outline" 
                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 hover:text-purple-800 transition-colors whitespace-nowrap"
                  >
                    {text}
                  </Button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
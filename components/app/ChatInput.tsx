import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Paperclip, FileText, X, Upload } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { useRef } from 'react';
import { toast } from 'sonner';
import { FileItem } from './types';
import { v4 as uuidv4 } from 'uuid';

type ChatInputProps = {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>, options?: { experimental_attachments?: FileList }) => void;
  files: FileList | undefined;
  setFiles: (files: FileList | undefined) => void;
  selectedFile: FileItem | null;
  setSelectedFile: (file: FileItem | null) => void;
  recentFiles: FileItem[];
};

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  files,
  setFiles,
  selectedFile,
  setSelectedFile,
  recentFiles
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
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
                          ref={fileInputRef}
                          accept=".pdf,.docx,.txt"
                          onChange={async (e) => {
                            if (e.target.files?.length) {
                              const file = e.target.files[0];
                              
                              try {
                                const fileExt = file.name.split('.').pop() || '';
                                const newFile: FileItem = {
                                  id: uuidv4(),
                                  name: file.name,
                                  date: new Date().toISOString().split('T')[0],
                                  type: fileExt,
                                  description: `Uploaded file: ${file.name}`,
                                  tags: ["uploaded"]
                                };
                                setFiles(e.target.files);
                                setSelectedFile(newFile);
                                toast.success('File selected successfully');
                              } catch (error) {
                                console.error('Error handling file:', error);
                                toast.error('Error handling file. Please try again.');
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
  );
} 
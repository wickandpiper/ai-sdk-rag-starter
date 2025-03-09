import { Message } from '@ai-sdk/react';
import { Loader2 } from 'lucide-react';
import { ChatInput } from './ChatInput';
import { FileItem } from './types';

type ChatSectionProps = {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>, options?: { experimental_attachments?: FileList }) => void;
  isLoading: boolean;
  files: FileList | undefined;
  setFiles: (files: FileList | undefined) => void;
  selectedFile: FileItem | null;
  setSelectedFile: (file: FileItem | null) => void;
  recentFiles: FileItem[];
};

export function ChatSection({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  files,
  setFiles,
  selectedFile,
  setSelectedFile,
  recentFiles
}: ChatSectionProps) {
  return (
    <div className="w-2/3 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="w-full max-w-3xl mx-auto space-y-4">
          {messages.map(m => (
            <div 
              key={m.id} 
              className={`whitespace-pre-wrap ${m.content ? 'animate-fade-in' : 'hidden'} ${
                m.role === 'assistant' 
                  ? 'ml-4 mr-12' 
                  : 'ml-12 mr-4'
              }`}
            >
              <div 
                className={`rounded-lg p-4 shadow-sm ${
                  m.role === 'assistant' 
                    ? 'bg-gradient-to-br from-purple-100/80 via-white/90 to-indigo-100/80 border border-purple-100 text-purple-900 rounded-lg' 
                    : 'bg-white/90 backdrop-blur-sm text-purple-900 rounded-lg'
                }`}
              >
                <div className={`font-semibold mb-2 ${
                  m.role === 'assistant' 
                    ? 'text-purple-700 flex items-center' 
                    : 'text-purple-700'
                }`}>
                  {m.role === 'assistant' ? (
                    <>
                      <span className="mr-2 inline-block w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                      Chip
                    </>
                  ) : 'You'}
                </div>
                <div className="text-purple-900">
                  {m.content}
                </div>
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
      
      <ChatInput 
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        files={files}
        setFiles={setFiles}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        recentFiles={recentFiles}
      />
    </div>
  );
} 
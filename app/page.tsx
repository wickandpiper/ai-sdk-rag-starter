'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { toast } from 'sonner';
import { 
  Header, 
  FileList, 
  ChatSection, 
  getFileIcon, 
  FileItem 
} from '@/components/app';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    maxSteps: 3,
  });

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentProject, setCurrentProject] = useState("Default Project");
  const [searchQuery, setSearchQuery] = useState("");
  const [fileFilter, setFileFilter] = useState("all");
  const [fileSortBy, setFileSortBy] = useState("date");
  const [fileSearchQuery, setFileSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Add state for notes
  const [notes, setNotes] = useState<Array<{
    id: string;
    title: string;
    updatedAt: string;
    wordCount: number;
    htmlContent?: string;
    markdownContent?: string;
    jsonContent?: any;
    images?: any[];
  }>>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreNotes, setHasMoreNotes] = useState(false);

  // Update function to load notes using the API route
  const loadNotes = async () => {
    try {
      setIsLoadingNotes(true);
      const response = await fetch(`/api/notes?page=1&pageSize=5`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const fetchedNotes = await response.json();
      setNotes(fetchedNotes);
      setHasMoreNotes(fetchedNotes.length === 5);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setIsLoadingNotes(false);
    }
  };

  // Update function to load more notes using the API route
  const loadMoreNotes = async () => {
    try {
      setIsLoadingNotes(true);
      const nextPage = currentPage + 1;
      const response = await fetch(`/api/notes?page=${nextPage}&pageSize=5`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const moreNotes = await response.json();
      
      if (moreNotes.length > 0) {
        setNotes(prev => [...prev, ...moreNotes]);
        setCurrentPage(nextPage);
        setHasMoreNotes(moreNotes.length === 5);
      } else {
        setHasMoreNotes(false);
      }
    } catch (error) {
      console.error('Error loading more notes:', error);
      toast.error('Failed to load more notes');
    } finally {
      setIsLoadingNotes(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Load notes on component mount
  useEffect(() => {
    loadNotes();
  }, []);

  // Convert notes to FileItem format
  const notesAsFiles: FileItem[] = notes.map(note => ({
    id: note.id,
    name: note.title,
    date: formatDate(note.updatedAt),
    type: 'note',
    description: `Word count: ${note.wordCount}`,
    tags: ['note'],
    url: `/notes/${note.id}`,
    content: {
      title: note.title,
      wordCount: note.wordCount,
      htmlContent: note.htmlContent,
      markdownContent: note.markdownContent,
      jsonContent: note.jsonContent,
      images: note.images
    }
  }));

  // Fallback to sample files if no notes are loaded yet
  const [recentFiles, setRecentFiles] = useState<FileItem[]>([
    { id: "sample-1", name: "YIT Construction.pdf", date: "2024-02-24", type: "pdf", description: "User research findings from interviews with 10 participants", tags: ["research", "user-testing"], url: "/sample-files/30d54b9e-03ba-4cdb-8ad4-41332d47073bYITPlatform.pdf" },
    { id: "sample-2", name: "Research Notes.pdf", date: "2024-02-24", type: "pdf", description: "User research findings from interviews with 10 participants", tags: ["research", "user-testing"], url: "/sample-files/sample-pdf.pdf" },
    { id: "sample-3", name: "User Interviews.docx", date: "2024-02-23", type: "docx", description: "Transcripts from user interviews conducted in February", tags: ["research", "interviews"], url: "/sample-files/sample-word.docx" },
    { id: "sample-4", name: "Design Brief.pdf", date: "2024-02-22", type: "pdf", description: "Project requirements and design specifications", tags: ["design", "requirements"], url: "/sample-files/sample-pdf.pdf" },
    { id: "sample-5", name: "Persona Template.pptx", date: "2024-02-21", type: "pptx", description: "Template for creating user personas", tags: ["templates", "personas"], url: "/sample-files/sample-powerpoint.pptx" },
  ]);

  // Combine notes with recent files
  const allFiles = [...notesAsFiles, ...recentFiles];

  const filteredFiles = allFiles
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300">
      <Header 
        currentProject={currentProject}
        setCurrentProject={setCurrentProject}
        fileSearchQuery={fileSearchQuery}
        setFileSearchQuery={setFileSearchQuery}
        setFiles={setFiles}
        setSelectedFile={setSelectedFile}
        setRecentFiles={setRecentFiles}
        setIsUploading={setIsUploading}
      />
      
      <div className="flex h-[calc(100vh-64px)]">
        <FileList 
          viewMode={viewMode}
          setViewMode={setViewMode}
          filteredFiles={filteredFiles}
          getFileIcon={getFileIcon}
          hasMoreNotes={hasMoreNotes}
          isLoadingNotes={isLoadingNotes}
          onLoadMoreNotes={loadMoreNotes}
        />
        
        <ChatSection 
          messages={messages}
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          files={files}
          setFiles={setFiles}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          recentFiles={recentFiles}
        />
      </div>
      
      {isLoadingNotes && (
        <div className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-md shadow-lg">
          Loading notes...
        </div>
      )}
    </div>
  );
} 
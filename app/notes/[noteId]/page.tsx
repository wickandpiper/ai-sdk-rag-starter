"use client";

import TailwindAdvancedEditor from "@/components/ui/Editor/editor";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Users, MessageSquare, Palette, ListOrdered, Loader2 } from "lucide-react";
import { fetchNoteMetadata } from "@/lib/services/client-note-service";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { motion, AnimatePresence } from "framer-motion";

export default function NotePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("Untitled Note");
  const [isNewNote, setIsNewNote] = useState(false);
  const [titleManuallyChanged, setTitleManuallyChanged] = useState(false);
  const [titleJustChanged, setTitleJustChanged] = useState(false);
  const [lastContentUpdate, setLastContentUpdate] = useState(0);
  const [contentLength, setContentLength] = useState(0);
  const params = useParams<{ noteId: string }>();
  const router = useRouter();
  const noteId = params?.noteId || 'new';
  const editorRef = useRef<any>(null);
  
  // Minimum content length before generating a title (roughly a paragraph)
  const MIN_CONTENT_LENGTH = 200;
  // Minimum time between content updates before generating a title (5 seconds)
  const MIN_CONTENT_UPDATE_INTERVAL = 5000;

  // Debounced function to save title changes with a longer delay
  const debouncedSaveTitle = useDebouncedCallback(async (newTitle: string) => {
    if (!noteId || noteId === 'new' || !newTitle) return;
    
    try {
      // Call API to update just the title
      const response = await fetch('/api/notes/update-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId,
          title: newTitle
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save title');
      }
      
      // No success toast for title saves to reduce notification noise
    } catch (error) {
      console.error("Error saving title:", error);
      // Only show error toasts for critical failures
      toast.error("Failed to save title");
    }
  }, 1500); // Increased to 1.5 seconds to reduce update frequency

  // Handle title change with a local state update first
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setTitleManuallyChanged(true);
    debouncedSaveTitle(newTitle);
  };

  // Function to generate a title based on content with improved timing
  const generateTitleFromContent = async (content: string) => {
    // Skip if title was manually changed or content is too short
    if (titleManuallyChanged || !content || content.length < MIN_CONTENT_LENGTH) {
      return;
    }
    
    // Track content length for future comparisons
    setContentLength(content.length);
    
    // Check if enough time has passed since the last content update
    const now = Date.now();
    if (now - lastContentUpdate < MIN_CONTENT_UPDATE_INTERVAL) {
      return;
    }
    
    // Update the last content update time
    setLastContentUpdate(now);
    
    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          maxLength: 50
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate title');
      }
      
      const data = await response.json();
      if (data.title && data.title !== title) {
        // Set the title with animation
        setTitle(data.title);
        setTitleJustChanged(true);
        
        // Reset the animation flag after a delay
        setTimeout(() => {
          setTitleJustChanged(false);
        }, 2000);
        
        debouncedSaveTitle(data.title);
      }
    } catch (error) {
      console.error("Error generating title:", error);
      // Don't show error toast to user as this is a background feature
    }
  };

  // Store editor reference
  const setEditorReference = (editor: any) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    const loadNoteTitle = async () => {
      // Check if this is a new note
      if (noteId === 'new') {
        setTitle("New Note");
        setIsNewNote(true);
        setIsLoading(false);
        return;
      }
      
      try {
        // Show loading toast only for initial load with a shorter duration
        toast.loading("Loading note...", {
          id: "note-loading",
          duration: 1000 // Reduced duration
        });
        
        // Use the client-side service to fetch metadata
        const metadata = await fetchNoteMetadata(noteId);
        
        if (metadata?.title) {
          setTitle(metadata.title);
          // No success toast here to reduce notification noise
          toast.dismiss("note-loading"); // Just dismiss the loading toast
        }
      } catch (e) {
        console.error("Error loading note title:", e);
        toast.error("Failed to load note", { id: "note-loading" });
        setError("Failed to load note content");
      }
      
      // Set loading to false after a brief delay to show the loading state
      setTimeout(() => {
        setIsLoading(false);
      }, 300); // Reduced delay
    };

    loadNoteTitle();
  }, [noteId]);

  // Animation variants for title changes
  const titleAnimationVariants = {
    initial: { opacity: 0.7 },
    animate: { opacity: 1 },
    exit: { opacity: 0.7 }
  };

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Breadcrumb navigation */}
      <div className="px-4 py-2 text-sm text-purple-600 bg-white">
        <div className="flex items-center space-x-2">
          <Link href="/" className="hover:text-purple-800">Home</Link>
          <span>›</span>
          <AnimatePresence mode="wait">
            <motion.span 
              key={title} 
              className="text-purple-800 truncate max-w-[calc(100%-4rem)] overflow-hidden text-ellipsis"
              initial={titleJustChanged ? "initial" : false}
              animate="animate"
              exit="exit"
              variants={titleAnimationVariants}
              transition={{ duration: 0.5 }}
            >
              {isLoading ? "Loading..." : isNewNote ? "New Note" : title}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Header with title and back button */}
      <header className="sticky top-0 z-10 border-b border-purple-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Link href="/" className="text-purple-600 hover:text-purple-700 flex-shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              {isLoading ? (
                <div className="flex items-center flex-shrink-0">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-purple-600" />
                  <span className="text-xl font-semibold text-purple-900">Loading...</span>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={title}
                    initial={titleJustChanged ? "initial" : false}
                    animate="animate"
                    exit="exit"
                    variants={titleAnimationVariants}
                    transition={{ duration: 0.5 }}
                    className="w-full min-w-0 flex-1 overflow-hidden"
                  >
                    <input
                      type="text"
                      value={title}
                      onChange={handleTitleChange}
                      placeholder="Untitled Note"
                      className="bg-transparent text-xl font-semibold text-purple-900 placeholder-purple-300 focus:outline-none w-full overflow-visible min-w-0"
                    />
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content area with loading state or editor */}
      <main className="container mx-auto p-4">
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center min-h-[500px]">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>Error: {error}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <TailwindAdvancedEditor 
              title={title} 
              initialResourceId={isNewNote ? 'new' : noteId} 
              onTitleChange={debouncedSaveTitle}
              onContentChange={generateTitleFromContent}
              setEditorRef={setEditorReference}
            />
          </div>
        )}
      </main>

      {/* Floating action bar */}
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center bg-white rounded-full shadow-lg border border-purple-100 p-1">
          <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-full">
            <Plus className="h-5 w-5" />
          </button>
          <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-full">
            <Users className="h-5 w-5" />
          </button>
          <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-full">
            <MessageSquare className="h-5 w-5" />
          </button>
          <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-full">
            <Palette className="h-5 w-5" />
          </button>
          <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-full">
            <ListOrdered className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 
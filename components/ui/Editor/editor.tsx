"use client";
import { defaultEditorContent } from "@/lib/content";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  ImageResizer,
  type JSONContent,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste,
} from "novel";
import { useEffect, useState, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { MathSelector } from "./selectors/math-selector";
import { NodeSelector } from "./selectors/node-selector";
import { Separator } from "@/components/ui/separator";

import GenerativeMenuSwitch from "../Tailwind/Generative/generative-menu-switch";
import { uploadFn } from "../Tailwind/image-upload";
import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "../Tailwind/slash-command";
import { saveEditorContent, getEditorContent } from "@/lib/services/editor-service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { fetchNoteContent } from "@/lib/services/client-note-service";

const hljs = require("highlight.js");

const extensions = [...defaultExtensions, slashCommand];

const TailwindAdvancedEditor = ({ 
  title = "Untitled Note",
  initialResourceId,
  onTitleChange,
  onContentChange,
  setEditorRef,
  readOnly = false,
  initialContent: providedInitialContent
}: { 
  title?: string,
  initialResourceId?: string,
  onTitleChange?: (title: string) => void,
  onContentChange?: (content: string) => void,
  setEditorRef?: (editor: EditorInstance) => void,
  readOnly?: boolean,
  initialContent?: JSONContent
}) => {
  const [saveStatus, setSaveStatus] = useState<string>("Saved");
  const [charsCount, setCharsCount] = useState<number>(0);
  const [currentResourceId, setCurrentResourceId] = useState<string | null>(initialResourceId || null);
  const [isFirstSave, setIsFirstSave] = useState(true);
  const router = useRouter();
  const [editorContent, setEditorContent] = useState<JSONContent | null>(null);
  const editorRef = useRef<EditorInstance | null>(null);
  const contentLoadedRef = useRef(false);

  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  // Initialize editor with stored content if available
  const storedContent = typeof window !== 'undefined' ? window.localStorage.getItem('novel-content') : null;
  // Use provided initialContent first, then editorContent if available, otherwise fall back to stored content or default
  const initialContent = providedInitialContent || editorContent || (storedContent ? JSON.parse(storedContent) : defaultEditorContent);
  
  // Initialize editor with stored content if available
  useEffect(() => {
    // If we have an initialResourceId, we should clear any cached content
    if (initialResourceId) {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('novel-content');
      }
    }
  }, [initialResourceId]);

  //Apply Codeblock Highlighting on the HTML from editor.getHTML()
  const highlightCodeblocks = (content: string) => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    doc.querySelectorAll("pre code").forEach((el) => {
      // @ts-ignore
      // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
      hljs.highlightElement(el);
    });
    return new XMLSerializer().serializeToString(doc);
  };

  const debouncedUpdates = useDebouncedCallback(async (editor: EditorInstance) => {
    try {
      const json = editor.getJSON();
      const wordCount = editor.storage.characterCount.words();
      setCharsCount(wordCount);
      
      const htmlContent = highlightCodeblocks(editor.getHTML());
      const markdownContent = editor.storage.markdown 
        ? editor.storage.markdown.getMarkdown() 
        : editor.getHTML();
      
      // Don't pass resourceId if it's 'new' or undefined
      const resourceIdToSave = currentResourceId === 'new' ? undefined : currentResourceId;
      
      // Save to database using API route
      const response = await fetch('/api/editor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonContent: json,
          htmlContent,
          markdownContent,
          wordCount,
          resourceId: resourceIdToSave, // Only pass valid resource IDs
          title // Pass the title
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save content');
      }
      
      const data = await response.json();
      const resourceId = data.resourceId;
      
      // If this is a new note (no current resource ID), update the URL
      if (!currentResourceId || currentResourceId === 'new') {
        // Store the resource ID for future use
        setCurrentResourceId(resourceId);
        
        // Store the resource ID in localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('last-resource-id', resourceId);
        }
        
        // Update the URL to include the resource ID
        if (typeof window !== 'undefined' && window.history) {
          const newUrl = `/notes/${resourceId}`;
          window.history.replaceState({}, '', newUrl);
          
          // Show a notification when creating a new note
          toast.success("Note created successfully");
        }
        
        console.log("New note saved with resource ID:", resourceId);
      }
      
      setSaveStatus("Saved");
    } catch (error) {
      console.error("Error saving editor content:", error);
      setSaveStatus("Error Saving");
      // Keep error notifications as they're essential
      toast.error("Error saving editor content: " + (error instanceof Error ? error.message : String(error)));
    }
  }, 800); // Slightly increased debounce time for regular saves

  // Update editor content when it's loaded
  useEffect(() => {
    if (editorRef.current && editorContent) {
      console.log("Setting editor content with loaded content", editorContent);
      
      // Set a flag to indicate content has been loaded
      contentLoadedRef.current = true;
      
      // Force update the editor content
      try {
        editorRef.current.commands.setContent(editorContent);
        console.log("Editor content updated successfully");
      } catch (error) {
        console.error("Error updating editor content:", error);
      }
    }
  }, [editorContent]);

  // Store editor reference when it's created
  const handleEditorUpdate = ({ editor }: { editor: EditorInstance }) => {
    // Store the editor reference if not already set
    if (!editorRef.current) {
      console.log("Editor reference set");
      editorRef.current = editor;
      
      // Share the editor reference with the parent component if needed
      if (setEditorRef) {
        setEditorRef(editor);
      }
      
      // If we already have content loaded, set it now
      if (editorContent) {
        console.log("Setting editor content on first update", editorContent);
        try {
          editor.commands.setContent(editorContent);
          console.log("Editor content set on first update");
        } catch (error) {
          console.error("Error setting editor content on first update:", error);
        }
      }
      
      // Set editor to readonly mode if specified
      if (readOnly) {
        editor.setEditable(false);
      }
    }
    
    // Skip updates if in readonly mode
    if (readOnly) return;
    
    // Regular update handling
    debouncedUpdates(editor);
    setSaveStatus("Unsaved");
    
    // Extract text content for AI title generation if needed
    if (onContentChange) {
      // Only extract content if there's a significant amount of text
      const wordCount = editor.storage.characterCount.words();
      if (wordCount > 30) { // Only trigger if there's a reasonable amount of content
        const textContent = extractTextFromEditor(editor);
        if (textContent && textContent.length > 100) { // Only send substantial content
          onContentChange(textContent);
        }
      }
    }
  };
  
  // Helper function to extract text from editor for summarization
  const extractTextFromEditor = (editor: EditorInstance): string => {
    try {
      // Get plain text from editor
      const text = editor.getText();
      return text;
    } catch (error) {
      console.error("Error extracting text from editor:", error);
      return '';
    }
  };

  // Effect to sync title changes from parent
  useEffect(() => {
    // If title changes from parent and we have a resource ID, save it
    if (currentResourceId && onTitleChange && title) {
      onTitleChange(title);
    }
  }, [title, currentResourceId]);

  useEffect(() => {
    const loadContent = async () => {
      // Skip loading content if we're in readonly mode and have initialContent
      if (readOnly && providedInitialContent) {
        return;
      }
      
      // Skip if we've already loaded content
      if (contentLoadedRef.current) {
        return;
      }
      
      try {
        // If we have a resource ID, try to load content from the server
        if (initialResourceId && initialResourceId !== 'new') {
          console.log("Loading content for resource ID:", initialResourceId);
          setSaveStatus("Loading...");
          
          // Fetch note content from the server
          const noteData = await fetchNoteContent(initialResourceId);
          
          if (noteData && noteData.metadata) {
            console.log("Content loaded successfully");
            
            // Check if we have valid jsonContent
            if (noteData.metadata.jsonContent) {
              setEditorContent(noteData.metadata.jsonContent);
              setSaveStatus("Saved");
            } else {
              console.warn("Note metadata found but missing jsonContent property - using fallback content");
              // Create a fallback content structure
              const fallbackContent = {
                type: 'doc',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: noteData.content || 'Content could not be loaded properly'
                      }
                    ]
                  }
                ]
              };
              setEditorContent(fallbackContent);
              setSaveStatus("Recovered");
            }
            
            // Update title if available
            if (noteData.metadata.title && onTitleChange) {
              onTitleChange(noteData.metadata.title);
            }
            
            // Mark content as loaded
            contentLoadedRef.current = true;
          } else {
            console.log("No content found for resource ID:", initialResourceId);
            setSaveStatus("New Note");
          }
        } else if (initialResourceId === 'new') {
          // Handle new note case
          console.log("Creating new note");
          setSaveStatus("New Note");
          setCurrentResourceId(null); // Ensure we don't have a resourceId for new notes
          contentLoadedRef.current = true;
        } else {
          // Check if we have a last resource ID in localStorage
          const lastResourceId = typeof window !== 'undefined' ? window.localStorage.getItem("last-resource-id") : null;
          
          if (lastResourceId) {
            console.log("Found last resource ID in localStorage:", lastResourceId);
            
            // Try to load content for the last resource ID
            const noteData = await fetchNoteContent(lastResourceId);
            
            if (noteData && noteData.metadata && noteData.metadata.jsonContent) {
              console.log("Content loaded successfully from last resource ID");
              setEditorContent(noteData.metadata.jsonContent);
              setSaveStatus("Saved");
              setCurrentResourceId(lastResourceId);
              
              // Update title if available
              if (noteData.metadata.title && onTitleChange) {
                onTitleChange(noteData.metadata.title);
              }
              
              // Update URL to include the resource ID
              if (typeof window !== 'undefined' && window.history) {
                const newUrl = `/notes/${lastResourceId}`;
                window.history.replaceState({ resourceId: lastResourceId }, '', newUrl);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error loading content:", error);
        setSaveStatus("Error Loading");
        toast.error("Error loading content: " + (error instanceof Error ? error.message : String(error)));
      }
    };
    
    loadContent();
  }, [initialResourceId, onTitleChange, readOnly, providedInitialContent]);

  if (!initialContent) return null;

  return (
    <div className="relative w-full h-full">
      {/* Only show status indicators if not in readonly mode */}
      {!readOnly && (
        <div className="flex absolute right-5 top-5 z-10 mb-5 gap-2">
          <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">{saveStatus}</div>
          <div className={charsCount ? "rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground" : "hidden"}>
            {charsCount} Words
          </div>
        </div>
      )}
      <EditorRoot>
        <EditorContent
          key={editorContent ? "loaded-content" : "default-content"}
          initialContent={initialContent}
          extensions={extensions}
          className="relative min-h-[500px] w-full border-muted bg-background sm:mb-[calc(20vh)]"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class:
                "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onUpdate={handleEditorUpdate}
          slotAfter={<ImageResizer />}
        >
          {/* Only show editor commands if not in readonly mode */}
          {!readOnly && (
            <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
              <EditorCommandEmpty className="px-2 text-muted-foreground">No results</EditorCommandEmpty>
              <EditorCommandList>
                {suggestionItems.map((item) => (
                  <EditorCommandItem
                    value={item.title}
                    onCommand={(val) => {
                      item.command ? item.command(val) : null;
                    }}
                    className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                    key={item.title}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </EditorCommandItem>
                ))}
              </EditorCommandList>
            </EditorCommand>
          )}

          {/* Only show editor toolbar if not in readonly mode */}
          {!readOnly && (
            <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
              <Separator orientation="vertical" />
              <NodeSelector open={openNode} onOpenChange={setOpenNode} />
              <Separator orientation="vertical" />

              <LinkSelector open={openLink} onOpenChange={setOpenLink} />
              <Separator orientation="vertical" />
              <MathSelector />
              <Separator orientation="vertical" />
              <TextButtons />
              <Separator orientation="vertical" />
              <ColorSelector open={openColor} onOpenChange={setOpenColor} />
            </GenerativeMenuSwitch>
          )}
        </EditorContent>
      </EditorRoot>
    </div>
  );
};

export default TailwindAdvancedEditor;
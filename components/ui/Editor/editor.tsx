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
import { useEffect, useState } from "react";
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
  initialResourceId
}: { 
  title?: string,
  initialResourceId?: string
}) => {
  const [saveStatus, setSaveStatus] = useState<string>("Saved");
  const [charsCount, setCharsCount] = useState<number>(0);
  const [currentResourceId, setCurrentResourceId] = useState<string | null>(initialResourceId || null);
  const [isFirstSave, setIsFirstSave] = useState(true);
  const router = useRouter();

  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  // Initialize editor with stored content if available
  const storedContent = typeof window !== 'undefined' ? window.localStorage.getItem('novel-content') : null;
  const initialContent = storedContent ? JSON.parse(storedContent) : defaultEditorContent;
  
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
          resourceId: currentResourceId, // Pass the current resource ID if it exists
          title // Pass the title
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save content');
      }
      
      const data = await response.json();
      const resourceId = data.resourceId;
      
      // Only update URL and state if this is a new resource
      if (resourceId !== currentResourceId) {
        setCurrentResourceId(resourceId);
        
        // Store the resource ID in localStorage for recovery
        window.localStorage.setItem("last-resource-id", resourceId);
        
        // Update the URL to include the resource ID
        if (typeof window !== 'undefined' && window.history && isFirstSave) {
          const newUrl = `/notes/${resourceId}`;
          window.history.pushState({ resourceId }, '', newUrl);
          setIsFirstSave(false);
        }
      }
      
      setSaveStatus("Saved");
    } catch (error) {
      console.error("Error saving editor content:", error);
      setSaveStatus("Error Saving");
      toast.error("Error saving editor content: " + (error instanceof Error ? error.message : String(error)));
    }
  }, 500);

  useEffect(() => {
    const loadContent = async () => {
      // Check if we have a resource ID in the URL
      if (typeof window !== 'undefined') {
        try {
          const urlPath = window.location.pathname;
          const urlResourceId = urlPath.split('/').pop();
          
          // If we're creating a new note
          if (urlResourceId === 'new') {
            setCurrentResourceId(null);
            return;
          }
          
          // If we have a resource ID in the URL, try to load the content
          if (urlResourceId && urlResourceId !== 'new') {
            try {
              // Show loading toast
              toast.loading("Loading note content...", {
                id: "note-content-loading"
              });
              
              // Try to load from localStorage first
              const cachedContent = localStorage.getItem(`note-content-${urlResourceId}`);
              if (cachedContent) {
                // Use cached content
                toast.success("Note loaded from cache", { id: "note-content-loading" });
                return;
              }
              
              // Fetch from API
              const result = await fetchNoteContent(urlResourceId);
              
              if (result.metadata && result.metadata.jsonContent) {
                setCurrentResourceId(urlResourceId);
                toast.success("Note loaded successfully");
                
                // Cache the content
                localStorage.setItem(`note-content-${urlResourceId}`, JSON.stringify(result.metadata.jsonContent));
                localStorage.setItem(`note-metadata-${urlResourceId}`, JSON.stringify(result.metadata));
                
                return;
              }
            } catch (error) {
              console.error("Error loading note content:", error);
              toast.error("Failed to load note content", { id: "note-content-loading" });
            }
          }
          
          // Default case: use default content
          setCurrentResourceId(null);
        } catch (error) {
          console.error("Error in content loading process:", error);
          toast.error("Error loading content");
          setCurrentResourceId(null);
        }
      };
      
      loadContent();
      
      // Handle browser navigation events
      const handlePopState = (event: PopStateEvent) => {
        if (event.state && event.state.resourceId) {
          // Force reload the page to get fresh content
          window.location.reload();
        }
      };
      
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    };
    
    loadContent();
  }, []);

  if (!initialContent) return null;

  return (
    <div className="relative w-full h-full">
      <div className="flex absolute right-5 top-5 z-10 mb-5 gap-2">
        <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">{saveStatus}</div>
        <div className={charsCount ? "rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground" : "hidden"}>
          {charsCount} Words
        </div>
      </div>
      <EditorRoot>
        <EditorContent
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
          onUpdate={({ editor }) => {
            debouncedUpdates(editor);
            setSaveStatus("Unsaved");
          }}
          slotAfter={<ImageResizer />}
        >
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
        </EditorContent>
      </EditorRoot>
    </div>
  );
};

export default TailwindAdvancedEditor;
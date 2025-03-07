import {
  CheckSquare,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  List,
  ListOrdered,
  MessageSquarePlus,
  Text,
  TextQuote,
  Twitter,
  Youtube,
  Loader2,
} from "lucide-react";
import { Command, createSuggestionItems, renderItems } from "novel";
import { uploadFn } from "./image-upload";
import { toast } from "sonner";

export const suggestionItems = createSuggestionItems([
  {
    title: "Send Feedback",
    description: "Let us know how we can improve.",
    icon: <MessageSquarePlus size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      window.open("/feedback", "_blank");
    },
  },
  {
    title: "Text",
    description: "Just start typing with plain text.",
    searchTerms: ["p", "paragraph"],
    icon: <Text size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleNode("paragraph", "paragraph").run();
    },
  },
  {
    title: "To-do List",
    description: "Track tasks with a to-do list.",
    searchTerms: ["todo", "task", "list", "check", "checkbox"],
    icon: <CheckSquare size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Heading 1",
    description: "Big section heading.",
    searchTerms: ["title", "big", "large"],
    icon: <Heading1 size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    searchTerms: ["subtitle", "medium"],
    icon: <Heading2 size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    searchTerms: ["subtitle", "small"],
    icon: <Heading3 size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list.",
    searchTerms: ["unordered", "point"],
    icon: <List size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a list with numbering.",
    searchTerms: ["ordered"],
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote.",
    searchTerms: ["blockquote"],
    icon: <TextQuote size={18} />,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleNode("paragraph", "paragraph").toggleBlockquote().run(),
  },
  {
    title: "Code",
    description: "Capture a code snippet.",
    searchTerms: ["codeblock"],
    icon: <Code size={18} />,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "Image",
    description: "Upload an image from your computer.",
    searchTerms: ["photo", "picture", "media"],
    icon: <ImageIcon size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      // upload image
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        if (input.files?.length) {
          const file = input.files[0];
          const pos = editor.view.state.selection.from;
          uploadFn(file, editor.view, pos);
        }
      };
      input.click();
    },
  },
  {
    title: "AI Image",
    description: "Generate an image using AI.",
    searchTerms: ["ai", "dall-e", "generate", "image", "picture"],
    icon: <ImageIcon size={18} />,
    command: async ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      
      // Prompt for image description
      const imagePrompt = prompt("Describe the image you want to generate:");
      
      if (imagePrompt && imagePrompt.trim() !== "") {
        try {
          // Get the current position
          const pos = editor.view.state.selection.from;
          
          // Insert a placeholder node that we can replace later
          const placeholderId = `placeholder-${Date.now()}`;
          editor.chain().focus().insertContent(`🖼️ [Generating AI image...]`).run();
          
          // Store the position where we'll insert the image
          const insertPos = pos;
          
          // Show toast notification
          toast.promise(
            // The promise to track
            (async () => {
              // Call the API to generate the image
              const response = await fetch("/api/generate-image", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: imagePrompt }),
              });
              
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to generate image");
              }
              
              return await response.json();
            })(),
            {
              loading: 'Generating your AI image...',
              success: (data) => {
                // Find the current selection
                const currentPos = editor.view.state.selection.from;
                
                // Find the placeholder text
                const docContent = editor.view.state.doc.textContent;
                const placeholderText = "🖼️ [Generating AI image...]";
                const placeholderPos = docContent.indexOf(placeholderText);
                
                if (placeholderPos >= 0) {
                  // Calculate the actual document position
                  const startPos = placeholderPos;
                  const endPos = startPos + placeholderText.length;
                  
                  // Delete the placeholder
                  editor.commands.deleteRange({
                    from: startPos,
                    to: endPos,
                  });
                  
                  // Insert the image at the same position
                  editor.chain().focus().setImage({ src: data.url, alt: imagePrompt }).run();
                } else {
                  // If placeholder not found, just append the image at current position
                  editor.chain().focus().setImage({ src: data.url, alt: imagePrompt }).run();
                }
                
                return 'Image generated successfully!';
              },
              error: (error) => {
                // Find the placeholder text
                const docContent = editor.view.state.doc.textContent;
                const placeholderText = "🖼️ [Generating AI image...]";
                const placeholderPos = docContent.indexOf(placeholderText);
                
                if (placeholderPos >= 0) {
                  // Calculate the actual document position
                  const startPos = placeholderPos;
                  const endPos = startPos + placeholderText.length;
                  
                  // Delete the placeholder
                  editor.commands.deleteRange({
                    from: startPos,
                    to: endPos,
                  });
                }
                
                return error.message || 'Failed to generate image';
              }
            }
          );
        } catch (error: any) {
          console.error("Error generating AI image:", error);
          toast.error(error.message || "Failed to generate image. Please try again.");
        }
      }
    },
  },
  {
    title: "Youtube",
    description: "Embed a Youtube video.",
    searchTerms: ["video", "youtube", "embed"],
    icon: <Youtube size={18} />,
    command: ({ editor, range }) => {
      const videoLink = prompt("Please enter Youtube Video Link");
      //From https://regexr.com/3dj5t
      const ytregex = new RegExp(
        /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/,
      );

      if (videoLink && ytregex.test(videoLink)) {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setYoutubeVideo({
            src: videoLink,
          })
          .run();
        
        toast.success("YouTube video embedded successfully");
      } else if (videoLink !== null) {
        toast.error("Please enter a correct YouTube video link");
        editor.chain().focus().deleteRange(range).run();
      }
    },
  },
  {
    title: "Twitter",
    description: "Embed a Tweet.",
    searchTerms: ["twitter", "embed"],
    icon: <Twitter size={18} />,
    command: ({ editor, range }) => {
      const tweetLink = prompt("Please enter Twitter Link");
      const tweetRegex = new RegExp(/^https?:\/\/(www\.)?x\.com\/([a-zA-Z0-9_]{1,15})(\/status\/(\d+))?(\/\S*)?$/);

      if (tweetLink && tweetRegex.test(tweetLink)) {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setTweet({
            src: tweetLink,
          })
          .run();
        
        toast.success("Tweet embedded successfully");
      } else if (tweetLink !== null) {
        toast.error("Please enter a correct Twitter link");
        editor.chain().focus().deleteRange(range).run();
      }
    },
  },
]);

export const slashCommand = Command.configure({
  suggestion: {
    items: () => suggestionItems,
    render: renderItems,
  },
});
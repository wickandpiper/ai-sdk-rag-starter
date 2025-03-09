"use client";

import TailwindAdvancedEditor from "@/components/ui/Editor/editor";
import { useEffect, useState } from "react";
import { getEditorContent } from "@/lib/services/editor-service";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Users, MessageSquare, Palette, ListOrdered, Loader2 } from "lucide-react";

export default function NotePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("Untitled Note");
  const params = useParams();
  const router = useRouter();
  const noteId = params.noteId as string;

  useEffect(() => {
    const loadNoteTitle = async () => {
      if (noteId) {
        try {
          const { metadata } = await getEditorContent(noteId);
          if (metadata?.title) {
            setTitle(metadata.title);
          }
        } catch (e) {
          console.error("Error loading note title:", e);
        }
      }
      
      // Set loading to false after a brief delay to show the loading state
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    loadNoteTitle();
  }, [noteId]);

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Breadcrumb navigation */}
      <div className="px-4 py-2 text-sm text-purple-600 bg-white">
        <div className="flex items-center space-x-2">
          <Link href="/" className="hover:text-purple-800">Home</Link>
          <span>›</span>
          <span className="text-purple-800">{isLoading ? "Loading..." : title}</span>
        </div>
      </div>

      {/* Header with title and back button */}
      <header className="sticky top-0 z-10 border-b border-purple-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-purple-600 hover:text-purple-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-purple-600" />
                  <span className="text-xl font-semibold text-purple-900">Loading...</span>
                </div>
              ) : (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Untitled Note"
                  className="bg-transparent text-xl font-semibold text-purple-900 placeholder-purple-300 focus:outline-none"
                />
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
            <TailwindAdvancedEditor title={title} />
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
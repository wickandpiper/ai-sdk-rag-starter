import { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';
import { Loader2, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DOCXPreviewProps {
  url: string;
}

export default function DOCXPreview({ url }: DOCXPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        
        if (containerRef.current) {
          try {
            await renderAsync(blob, containerRef.current, containerRef.current, {
              className: 'docx-preview',
              inWrapper: true,
              ignoreWidth: false,
              ignoreHeight: false,
            });
          } catch (renderError) {
            console.error('Error rendering DOCX:', renderError);
            throw new Error('The document appears to be corrupted or is not a valid DOCX file.');
          }
        }
      } catch (err) {
        console.error('Error handling DOCX:', err);
        setError(err instanceof Error ? err.message : 'Failed to load document. Please make sure it is a valid DOCX file.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [url]);

  return (
    <div className="flex flex-col items-center w-full">
      
      {isLoading && (
        <div className="flex justify-center items-center h-64 w-full">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
      )}
      
      {error && (
        <div className="flex flex-col justify-center items-center h-64 w-full">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600 text-center">{error}</p>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            download
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Download File</span>
          </a>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className="border border-purple-200 rounded-lg overflow-hidden shadow-sm w-full max-h-[500px] overflow-y-auto"
        style={{ display: isLoading || error ? 'none' : 'block' }}
      />
    </div>
  );
}
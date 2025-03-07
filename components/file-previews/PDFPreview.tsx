'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, ChevronLeft, ChevronRight, AlertCircle, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Set up the worker for PDF.js - using a local file
// We're using version 3.11.174 of the worker
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf-worker/pdf.worker.min.js`;

interface PDFPreviewProps {
  url: string;
}

export default function PDFPreview({ url }: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [versionMismatch, setVersionMismatch] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // Handle errors in the console
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message && event.message.includes('version')) {
        console.log('Caught version mismatch error:', event.message);
        setVersionMismatch(true);
        
        // If we get a version error, switch to fallback after 1.5 seconds
        setTimeout(() => {
          if (isLoading) {
            setUseFallback(true);
            setIsLoading(false);
          }
        }, 1500);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [isLoading]);

  // Set a timeout to switch to fallback view if loading takes too long
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        if (isLoading) {
          console.log('Loading timeout reached, switching to fallback view');
          setUseFallback(true);
          setIsLoading(false);
        }
      }, 5000); // 5 second timeout for loading
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.max(1, Math.min(numPages || 1, newPageNumber));
    });
  }

  // Fallback component when PDF can't be rendered
  const FallbackView = () => (
    <div className="flex flex-col items-center justify-center p-8 border border-purple-200 rounded-lg bg-purple-50">
      <FileText className="h-16 w-16 text-purple-400 mb-4" />
      <h3 className="text-lg font-medium text-purple-800 mb-2">PDF Preview Unavailable</h3>
      <p className="text-sm text-purple-600 mb-4 text-center">
        We couldn&apos;t render this PDF due to a version compatibility issue.
      </p>
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        download
        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        <span>Download PDF</span>
      </a>
    </div>
  );

  if (useFallback) {
    return <FallbackView />;
  }

  return (
    <div className="flex flex-col items-center w-full">
      
      {isLoading && (
        <div className="flex justify-center items-center h-64 w-full">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
      )}
      
      {versionMismatch && !useFallback && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4 w-full">
          <p className="text-yellow-700 text-sm">
            Warning: PDF.js version mismatch detected. The PDF may still display correctly.
          </p>
        </div>
      )}
      
      {error ? (
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
            <span>Download PDF</span>
          </a>
        </div>
      ) : (
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(err) => {
            console.error('Error loading PDF:', err);
            const errString = String(err);
            
            // If it's a version mismatch, we'll handle it with the global error handler
            if (errString.includes('version')) {
              setVersionMismatch(true);
              // We'll wait a bit to see if it renders despite the warning
              setTimeout(() => {
                if (isLoading) {
                  setUseFallback(true);
                  setIsLoading(false);
                }
              }, 1500);
            } else {
              // For other errors, show the error message
              setError('Failed to load PDF document. Please check if the file is valid.');
              setIsLoading(false);
            }
          }}
          loading={
            <div className="flex justify-center items-center h-64 w-full">
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
            </div>
          }
          className="border border-purple-200 rounded-lg overflow-hidden shadow-sm"
        >
          <Page 
            pageNumber={pageNumber} 
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={450}
            className="mx-auto"
            error={
              <div className="flex flex-col items-center justify-center p-4">
                <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                <p className="text-red-600 text-sm">Error rendering page</p>
              </div>
            }
          />
        </Document>
      )}
      
      {numPages && numPages > 1 && (
        <div className="flex items-center justify-center mt-4 space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-purple-700">
            Page {pageNumber} of {numPages}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => changePage(1)}
            disabled={pageNumber >= (numPages || 1)}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
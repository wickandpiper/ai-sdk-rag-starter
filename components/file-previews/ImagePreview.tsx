'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  url: string;
  alt: string;
}

export default function ImagePreview({ url, alt }: ImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex justify-center space-x-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          className="flex items-center space-x-1"
        >
          <ZoomIn className="h-4 w-4" />
          <span>Zoom In</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          className="flex items-center space-x-1"
        >
          <ZoomOut className="h-4 w-4" />
          <span>Zoom Out</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRotate}
          className="flex items-center space-x-1"
        >
          <RotateCw className="h-4 w-4" />
          <span>Rotate</span>
        </Button>
        
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          download
          className="inline-flex items-center space-x-1 h-9 px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </a>
      </div>
      
      <div className="border border-purple-200 rounded-lg overflow-hidden shadow-sm bg-white p-4 flex items-center justify-center">
        {isLoading && (
          <div className="absolute flex justify-center items-center h-64 w-64">
            <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
          </div>
        )}
        
        <div
          style={{
            transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
            transition: 'transform 0.3s ease',
            maxWidth: '100%',
            maxHeight: '400px',
          }}
        >
          <Image
            src={url}
            alt={alt}
            width={500}
            height={500}
            className="max-w-full max-h-[400px] object-contain"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </div>
    </div>
  );
}
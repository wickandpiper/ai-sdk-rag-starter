'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2, Download } from 'lucide-react';

interface PPTXPreviewProps {
  url: string;
  title: string;
}

export default function PPTXPreview({ url, title }: PPTXPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Since we can't directly render PPTX in the browser without a server component,
  // we'll show a placeholder with a PowerPoint icon
  return (
    <div className="flex flex-col items-center w-full">
      
      <div className="border border-purple-200 rounded-lg overflow-hidden shadow-sm p-6 bg-white w-full">
        <div className="flex flex-col items-center justify-center">
          {/* PowerPoint Icon */}
          <div className="w-24 h-24 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">PPT</span>
          </div>
          
          <h3 className="text-lg font-medium text-purple-800 mb-2">{title}</h3>
          <p className="text-sm text-purple-600 mb-4">PowerPoint Presentation</p>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            {/* Slide thumbnails (placeholders) */}
            {[1, 2, 3, 4].map((slide) => (
              <div 
                key={slide} 
                className="aspect-[16/9] bg-orange-100 rounded border border-orange-200 flex items-center justify-center"
              >
                <span className="text-orange-600 text-sm">Slide {slide}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
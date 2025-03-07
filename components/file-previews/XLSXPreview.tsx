'use client';

import { useEffect, useState } from 'react';
import { read, utils } from 'xlsx';
import Spreadsheet from 'react-spreadsheet';
import { Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface XLSXPreviewProps {
  url: string;
}

type Cell = {
  value: string | number | null;
};

export default function XLSXPreview({ url }: XLSXPreviewProps) {
  const [data, setData] = useState<Cell[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [sheetNames, setSheetNames] = useState<string[]>([]);

  useEffect(() => {
    const loadSpreadsheet = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = read(arrayBuffer);
        
        // Get all sheet names
        const sheets = workbook.SheetNames;
        setSheetNames(sheets);
        
        if (sheets.length > 0) {
          // Set the first sheet as active by default
          setActiveSheet(sheets[0]);
          
          // Convert the first sheet to data
          const worksheet = workbook.Sheets[sheets[0]];
          const jsonData = utils.sheet_to_json<Record<string, any>>(worksheet, { header: 1 });
          
          // Convert to the format expected by react-spreadsheet
          const formattedData = jsonData.map(row => 
            Array.isArray(row) 
              ? row.map(cell => ({ value: cell === undefined ? null : cell }))
              : [{ value: row === undefined ? null : row }]
          );
          
          setData(formattedData);
        }
      } catch (err) {
        console.error('Error rendering XLSX:', err);
        setError('Failed to load spreadsheet');
      } finally {
        setIsLoading(false);
      }
    };

    loadSpreadsheet();
  }, [url]);

  const handleSheetChange = async (sheetName: string) => {
    try {
      setIsLoading(true);
      setActiveSheet(sheetName);
      
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = read(arrayBuffer);
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = utils.sheet_to_json<Record<string, any>>(worksheet, { header: 1 });
      
      const formattedData = jsonData.map(row => 
        Array.isArray(row) 
          ? row.map(cell => ({ value: cell === undefined ? null : cell }))
          : [{ value: row === undefined ? null : row }]
      );
      
      setData(formattedData);
    } catch (err) {
      console.error('Error changing sheet:', err);
      setError('Failed to load sheet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {isLoading && (
        <div className="flex justify-center items-center h-64 w-full">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
      )}
      
      {error && (
        <div className="flex flex-col justify-center items-center h-64 w-full">
          <p className="text-red-500 mb-4">{error}</p>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            download
            className="inline-flex items-center space-x-1 px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download Excel File</span>
          </a>
        </div>
      )}
      
      {!isLoading && !error && (
        <>
          <div className="flex justify-between items-center mb-2">
            <div className="flex overflow-x-auto">
              {sheetNames.length > 1 && sheetNames.map((sheet) => (
                <button
                  key={sheet}
                  onClick={() => handleSheetChange(sheet)}
                  className={`px-3 py-1 text-xs rounded-t-md mr-1 ${
                    activeSheet === sheet
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  {sheet}
                </button>
              ))}
            </div>
            
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              download
              className="inline-flex items-center space-x-1 px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </a>
          </div>
          
          <div className="border border-purple-200 rounded-lg overflow-hidden shadow-sm max-h-[400px] overflow-auto">
            {/* @ts-ignore - Ignoring type issues with the Spreadsheet component */}
            <Spreadsheet data={data} />
          </div>
        </>
      )}
    </div>
  );
}
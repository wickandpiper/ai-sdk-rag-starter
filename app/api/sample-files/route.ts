import { NextResponse } from 'next/server';

// This API route will return information about sample files
export async function GET() {
  const sampleFiles = [
    {
      name: "Sample Document.pdf",
      type: "pdf",
      url: "/sample-files/sample-pdf.pdf",
      description: "A sample PDF document for testing",
      tags: ["sample", "pdf", "document"]
    },
    {
      name: "Data Analysis.xlsx",
      type: "xlsx",
      url: "/sample-files/sample-excel.xlsx",
      description: "Sample Excel spreadsheet with data",
      tags: ["sample", "excel", "data"]
    },
    {
      name: "Presentation.pptx",
      type: "pptx",
      url: "/sample-files/sample-powerpoint.pptx",
      description: "Sample PowerPoint presentation",
      tags: ["sample", "powerpoint", "presentation"]
    },
    {
      name: "Report.docx",
      type: "docx",
      url: "/sample-files/sample-word.docx",
      description: "Sample Word document",
      tags: ["sample", "word", "document"]
    },
    {
      name: "Chart.png",
      type: "png",
      url: "/sample-files/sample-image.png",
      description: "Sample PNG image",
      tags: ["sample", "image", "chart"]
    }
  ];

  return NextResponse.json({ files: sampleFiles });
} 
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft, Plus, Users, MessageSquare, Palette, ListOrdered } from 'lucide-react';
import Link from 'next/link';
import { default as Editor } from '@/components/ui/Editor/editor';

export default function NewNote() {

  const [ title, setTitle ] = useState("");

  const handleSave = async () => {
    console.log('Saving note:');
    // Here we would typically save to a database
  };

  return (
    <div className='min-h-screen bg-purple-50'>
      {/* Breadcrumb navigation */}
      <div className='px-4 py-2 text-sm text-purple-600 bg-white'>
        <div className='flex items-center space-x-2'>
          <Link href='/' className='hover:text-purple-800'>New Project</Link>
          <span>›</span>
          <Link href='/notes' className='hover:text-purple-800'>Notes</Link>
          <span>›</span>
          <span className='text-purple-800'>New Note</span>
        </div>
      </div>

      {/* Header with title and save button */}
      <header className='sticky top-0 z-10 border-b border-purple-100 bg-white/80 backdrop-blur-sm'>
        <div className='container mx-auto px-4 py-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Link href='/notes' className='text-purple-600 hover:text-purple-700'>
                <ArrowLeft className='h-5 w-5' />
              </Link>
              <input
                type='text'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Untitled Note'
                className='bg-transparent text-xl font-semibold text-purple-900 placeholder-purple-300 focus:outline-none'
              />
            </div>
            <Button onClick={handleSave} className='flex items-center gap-2' variant='default'>
              <Save className='h-4 w-4' />
              <span>Save</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content area with a simple contenteditable div */}
      <main className='container mx-auto p-4'>
        <div className='bg-white rounded-lg shadow-sm p-6'>
          <Editor />
        </div>
      </main>

      {/* Floating action bar */}
      <div className='fixed bottom-10 left-1/2 transform -translate-x-1/2 z-20'>
        <div className='flex items-center bg-white rounded-full shadow-lg border border-purple-100 p-1'>
          <button className='p-2 text-purple-600 hover:bg-purple-50 rounded-full'>
            <Plus className='h-5 w-5' />
          </button>
          <button className='p-2 text-purple-600 hover:bg-purple-50 rounded-full'>
            <Users className='h-5 w-5' />
          </button>
          <button className='p-2 text-purple-600 hover:bg-purple-50 rounded-full'>
            <MessageSquare className='h-5 w-5' />
          </button>
          <button className='p-2 text-purple-600 hover:bg-purple-50 rounded-full'>
            <Palette className='h-5 w-5' />
          </button>
          <button className='p-2 text-purple-600 hover:bg-purple-50 rounded-full'>
            <ListOrdered className='h-5 w-5' />
          </button>
        </div>
      </div>
    </div>
  );
  
}

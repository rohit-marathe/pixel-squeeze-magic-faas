import React, { useCallback, useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Clipboard } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, WebP, or GIF image.",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast({
        title: "No images found",
        description: "Please drop an image file.",
        variant: "destructive",
      });
      return;
    }

    const file = imageFiles[0];
    if (validateFile(file)) {
      onImageUpload(file);
    }
  }, [onImageUpload, toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const handlePaste = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            const file = new File([blob], `pasted-image.${type.split('/')[1]}`, { type });
            
            if (validateFile(file)) {
              onImageUpload(file);
            }
            return;
          }
        }
      }
      
      toast({
        title: "No image in clipboard",
        description: "Please copy an image first, then try pasting.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Paste error:', error);
      toast({
        title: "Paste failed",
        description: "Unable to paste image. Please try uploading instead.",
        variant: "destructive",
      });
    }
  }, [onImageUpload, toast]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className={`
              w-20 h-20 rounded-full flex items-center justify-center transition-colors
              ${isDragOver ? 'bg-blue-100' : 'bg-gray-100'}
            `}>
              <Upload className={`w-8 h-8 ${isDragOver ? 'text-blue-600' : 'text-gray-600'}`} />
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Drop your image here
            </h3>
            <p className="text-gray-600">
              Drag and drop your image file, or choose from the options below
            </p>
          </div>

          {/* Upload Options */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
              Choose from Computer
            </button>
            
            <button
              onClick={handlePaste}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              <Clipboard className="w-5 h-5" />
              Paste Image
            </button>
          </div>

          <p className="text-sm text-gray-500">
            Supports JPEG, PNG, WebP, and GIF • Max size: 10MB
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Keyboard Shortcut Hint */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          💡 Tip: You can also paste images directly with <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+V</kbd>
        </p>
      </div>
    </div>
  );
};

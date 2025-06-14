import React, { useState, useCallback } from 'react';
import { ImageUploader } from '../components/ImageUploader';
import { ImagePreview } from '../components/ImagePreview';
import { CompressedImageResult } from '../components/CompressedImageResult';
import { useToast } from '../hooks/use-toast';

interface ImageData {
  file: File;
  preview: string;
  originalSize: number;
}

interface CompressedResult {
  compressedBlob: Blob;
  compressedSize: number;
  compressionRatio: number;
}

const Index = () => {
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [compressedResult, setCompressedResult] = useState<CompressedResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = useCallback(async (file: File) => {
    console.log('Image uploaded:', file.name, file.size);
    
    // Create preview URL
    const preview = URL.createObjectURL(file);
    const imageData: ImageData = {
      file,
      preview,
      originalSize: file.size
    };
    
    setOriginalImage(imageData);
    setCompressedResult(null);
    
    // Start compression
    setIsCompressing(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      console.log('Sending image to OpenFaaS for compression...');
      
      // Direct call to your OpenFaaS server
      const response = await fetch('http://13.52.190.63:31112/function/compress-image', {
        method: 'POST',
        body: formData,
        mode: 'cors',
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Compression failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const compressedBlob = await response.blob();
      const compressedSize = compressedBlob.size;
      const compressionRatio = ((imageData.originalSize - compressedSize) / imageData.originalSize) * 100;
      
      console.log('Compression successful:', {
        originalSize: imageData.originalSize,
        compressedSize,
        ratio: compressionRatio
      });
      
      setCompressedResult({
        compressedBlob,
        compressedSize,
        compressionRatio
      });
      
      toast({
        title: "Image compressed successfully!",
        description: `Reduced size by ${compressionRatio.toFixed(1)}%`,
      });
      
    } catch (error) {
      console.error('Compression error:', error);
      
      let errorMessage = "Please try again with a different image.";
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = "Unable to connect to your OpenFaaS server at http://13.52.190.63:31112. Please check if the server is running and accessible.";
        } else if (error.message.includes('CORS')) {
          errorMessage = "CORS error: Your OpenFaaS server needs to allow cross-origin requests. You may need to configure CORS in your OpenFaaS gateway or function.";
        } else if (error.message.includes('502') || error.message.includes('503')) {
          errorMessage = "OpenFaaS server error: The compress-image function may not be deployed or is not responding.";
        }
      }
      
      toast({
        title: "Compression failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCompressing(false);
    }
  }, [toast]);

  const handleReset = useCallback(() => {
    if (originalImage?.preview) {
      URL.revokeObjectURL(originalImage.preview);
    }
    setOriginalImage(null);
    setCompressedResult(null);
    setIsCompressing(false);
  }, [originalImage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Image Compressor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compress your images instantly with our powerful OpenFaaS-powered compression engine. 
            Reduce file sizes while maintaining quality.
          </p>
        </div>

        {/* Main Content */}
        {!originalImage ? (
          <div className="max-w-4xl mx-auto">
            <ImageUploader onImageUpload={handleImageUpload} />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Image Preview Section */}
            <ImagePreview 
              originalImage={originalImage}
              compressedResult={compressedResult}
              isCompressing={isCompressing}
            />
            
            {/* Results Section */}
            {compressedResult && (
              <CompressedImageResult 
                originalImage={originalImage}
                compressedResult={compressedResult}
                onReset={handleReset}
              />
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Upload New Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

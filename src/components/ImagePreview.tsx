
import React from 'react';
import { Loader2 } from 'lucide-react';

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

interface ImagePreviewProps {
  originalImage: ImageData;
  compressedResult: CompressedResult | null;
  isCompressing: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  originalImage,
  compressedResult,
  isCompressing
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressedPreview = compressedResult 
    ? URL.createObjectURL(compressedResult.compressedBlob)
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Image Comparison
      </h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Original Image */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Original</h3>
            <p className="text-sm text-gray-600">
              {formatFileSize(originalImage.originalSize)}
            </p>
          </div>
          
          <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={originalImage.preview}
              alt="Original"
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="text-center text-sm text-gray-600">
            {originalImage.file.name}
          </div>
        </div>

        {/* Compressed Image */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Compressed</h3>
            {isCompressing ? (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Compressing...</span>
              </div>
            ) : compressedResult ? (
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  {formatFileSize(compressedResult.compressedSize)}
                </p>
                <p className="text-sm font-medium text-green-600">
                  {compressedResult.compressionRatio.toFixed(1)}% reduction
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Processing...</p>
            )}
          </div>
          
          <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden border-2 border-gray-200 flex items-center justify-center">
            {isCompressing ? (
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Compressing image...</p>
              </div>
            ) : compressedPreview ? (
              <img
                src={compressedPreview}
                alt="Compressed"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-gray-400">
                <p className="text-sm">Compressed image will appear here</p>
              </div>
            )}
          </div>
          
          {compressedResult && (
            <div className="text-center text-sm text-gray-600">
              compressed-{originalImage.file.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

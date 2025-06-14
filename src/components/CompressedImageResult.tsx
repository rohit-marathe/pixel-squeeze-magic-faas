
import React from 'react';
import { Download, BarChart3, FileImage } from 'lucide-react';

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

interface CompressedImageResultProps {
  originalImage: ImageData;
  compressedResult: CompressedResult;
  onReset: () => void;
}

export const CompressedImageResult: React.FC<CompressedImageResultProps> = ({
  originalImage,
  compressedResult,
  onReset
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    const url = URL.createObjectURL(compressedResult.compressedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compressed-${originalImage.file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <FileImage className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Compression Complete!
        </h2>
        <p className="text-gray-600">
          Your image has been successfully compressed and is ready for download.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 text-center shadow-sm">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatFileSize(originalImage.originalSize)}
          </div>
          <div className="text-sm text-gray-600">Original Size</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 text-center shadow-sm">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {formatFileSize(compressedResult.compressedSize)}
          </div>
          <div className="text-sm text-gray-600">Compressed Size</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 text-center shadow-sm">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {compressedResult.compressionRatio.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Size Reduction</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Compression Progress</span>
          <span>{compressedResult.compressionRatio.toFixed(1)}% saved</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${compressedResult.compressionRatio}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          <Download className="w-5 h-5" />
          Download Compressed Image
        </button>
        
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
        >
          <BarChart3 className="w-5 h-5" />
          Compress Another Image
        </button>
      </div>
    </div>
  );
};


export interface CompressionResult {
  compressedBlob: Blob;
  compressedSize: number;
  originalSize: number;
  compressionRatio: number;
}

export class OpenFaasService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = 'http://13.52.190.63:31112') {
    this.baseUrl = baseUrl;
  }

  async compressImage(file: File, quality: number = 80): Promise<CompressionResult> {
    try {
      console.log(`Compressing image: ${file.name} (${file.size} bytes)`);
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('quality', quality.toString());

      const response = await fetch(`${this.baseUrl}/function/compress-image`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type header, let the browser set it for FormData
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Compression failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const compressedBlob = await response.blob();
      const compressedSize = compressedBlob.size;
      const originalSize = file.size;
      const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

      console.log('Compression successful:', {
        originalSize,
        compressedSize,
        compressionRatio: compressionRatio.toFixed(2) + '%'
      });

      return {
        compressedBlob,
        compressedSize,
        originalSize,
        compressionRatio
      };
    } catch (error) {
      console.error('OpenFaaS compression error:', error);
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/system/functions`);
      return response.ok;
    } catch (error) {
      console.error('OpenFaaS health check failed:', error);
      return false;
    }
  }
}

// Export a default instance
export const openFaasService = new OpenFaasService();

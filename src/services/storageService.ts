import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'land-documents';
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/tiff',
];
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export const storageService = {
  validateFile(file: File): { valid: boolean; error?: string } {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file format: ${file.type}. Allowed formats: PDF, JPEG, PNG, WEBP, TIFF.`,
      };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        valid: false,
        error: `File size exceeds 50MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
      };
    }

    return { valid: true };
  },

  async uploadDocumentFile(
    file: File,
    userId: string,
    documentId?: string
  ): Promise<{ storagePath: string; signedUrl: string }> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const storagePath = `${userId}/${documentId || timestamp}_${sanitizedName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const signedUrl = await this.getSignedUrl(storagePath);
    return { storagePath, signedUrl };
  },

  async getSignedUrl(storagePath: string, expiresInSeconds: number = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error) {
      console.error('Error creating signed URL:', error);
      throw new Error(`Failed to generate signed document URL: ${error.message}`);
    }

    return data.signedUrl;
  },

  async deleteDocumentFile(storagePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);

    if (error) {
      console.error('Error deleting document file:', error);
      throw error;
    }
  },
};

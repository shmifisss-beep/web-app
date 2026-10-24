import { useState, useCallback } from 'react';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  status: UploadStatus;
  url?: string;
  error?: string;
}

// In real app — upload to Cloudflare R2 or Supabase Storage
export function useMediaUpload() {
  const [uploads, setUploads] = useState<UploadedFile[]>([]);

  const addFiles = useCallback((files: File[]) => {
    const newUploads: UploadedFile[] = files.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      preview: URL.createObjectURL(file),
      status: 'idle' as UploadStatus,
    }));
    setUploads((prev) => [...prev, ...newUploads]);
  }, []);

  const uploadAll = useCallback(async () => {
    // Simulate upload for now
    setUploads((prev) => prev.map((u) => ({ ...u, status: 'uploading' })));
    await new Promise((r) => setTimeout(r, 1500));
    setUploads((prev) =>
      prev.map((u) => ({
        ...u,
        status: 'success',
        url: u.preview, // In real app: returned URL from storage
      }))
    );
  }, []);

  const removeFile = useCallback((id: string) => {
    setUploads((prev) => {
      const found = prev.find((u) => u.id === id);
      if (found?.preview) URL.revokeObjectURL(found.preview);
      return prev.filter((u) => u.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    uploads.forEach((u) => {
      if (u.preview) URL.revokeObjectURL(u.preview);
    });
    setUploads([]);
  }, [uploads]);

  return { uploads, addFiles, uploadAll, removeFile, clearAll };
}

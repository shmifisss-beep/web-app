import { useState, useCallback } from 'react';
import { uploadToCloudflareR2 } from '../lib/cloudflareR2';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  status: UploadStatus;
  url?: string;
  error?: string;
}

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

  const uploadFile = useCallback(async (id: string, file: File) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: 'uploading', error: undefined } : u))
    );

    try {
      const publicUrl = await uploadToCloudflareR2(file);
      setUploads((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: 'success', url: publicUrl } : u))
      );
      return publicUrl;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setUploads((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: 'error', error: errorMsg } : u))
      );
      return null;
    }
  }, []);

  const uploadAll = useCallback(async () => {
    const pending = uploads.filter((u) => u.status === 'idle' || u.status === 'error');
    await Promise.all(pending.map((u) => uploadFile(u.id, u.file)));
  }, [uploads, uploadFile]);

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

  return { uploads, addFiles, uploadFile, uploadAll, removeFile, clearAll };
}

import { useState, useCallback } from 'react';
import { uploadToCloudflareR2 } from '../lib/cloudflareR2';
import type { MediaFile } from '../types';

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
  const patch = (id: string, p: Partial<UploadedFile>) =>
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...p } : u)));

  const addFiles = useCallback((files: File[]) => {
    setUploads((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: crypto.randomUUID(), file, preview: URL.createObjectURL(file), status: 'idle' as UploadStatus,
      })),
    ]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setUploads((prev) => {
      prev.filter((u) => u.id === id).forEach((u) => URL.revokeObjectURL(u.preview));
      return prev.filter((u) => u.id !== id);
    });
  }, []);

  /** Загружает все файлы и возвращает готовые MediaFile. Бросает ошибку при первой неудаче. */
  const uploadAll = useCallback(async (): Promise<MediaFile[]> => {
    const out: MediaFile[] = [];
    for (const u of uploads) {
      let url = u.url;
      if (!url) {
        patch(u.id, { status: 'uploading', error: undefined });
        try {
          url = await uploadToCloudflareR2(u.file);
          patch(u.id, { status: 'success', url });
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Ошибка загрузки';
          patch(u.id, { status: 'error', error: msg });
          throw new Error(msg);
        }
      }
      out.push({ id: u.id, type: u.file.type.startsWith('video/') ? 'video' : 'image', url, label: u.file.name });
    }
    return out;
  }, [uploads]);

  return { uploads, addFiles, uploadAll, removeFile };
}

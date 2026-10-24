import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, ImageIcon, Film, CheckCircle2, Loader2 } from 'lucide-react';
import type { UploadedFile } from '../../hooks/useMediaUpload';
import { cn } from '../../lib/utils';

interface MediaDropzoneProps {
  uploads: UploadedFile[];
  onAddFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
}

const MediaDropzone: React.FC<MediaDropzoneProps> = ({ uploads, onAddFiles, onRemove }) => {
  const onDrop = useCallback((files: File[]) => onAddFiles(files), [onAddFiles]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    maxSize: 200 * 1024 * 1024,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-accent bg-accent/5' : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/30',
        )}
      >
        <input {...getInputProps()} />
        <Upload className={cn('w-7 h-7 mx-auto mb-2', isDragActive ? 'text-accent' : 'text-slate-600')} />
        {isDragActive
          ? <p className="text-accent text-sm font-medium">Отпусти файлы...</p>
          : <>
              <p className="text-slate-400 text-sm font-medium mb-1">Перетащи скриншоты или видео</p>
              <p className="text-slate-600 text-xs">PNG, JPG, MP4, MOV — до 200MB</p>
            </>
        }
      </div>

      {uploads.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {uploads.map((u) => (
            <div key={u.id} className="relative group aspect-video bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
              {u.file.type.startsWith('image/') ? (
                <img src={u.preview} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film className="w-5 h-5 text-slate-500" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {u.status === 'uploading' && <Loader2 className="w-4 h-4 text-white animate-spin" />}
                {u.status === 'success' && <CheckCircle2 className="w-4 h-4 text-up" />}
              </div>
              {u.status !== 'uploading' && (
                <button
                  type="button"
                  onClick={() => onRemove(u.id)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaDropzone;

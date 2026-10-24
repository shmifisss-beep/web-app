import React, { useState } from 'react';
import type { MediaFile } from '../../types';
import { X, ChevronLeft, ChevronRight, Play, ImageIcon } from 'lucide-react';

interface MediaGalleryProps {
  media: MediaFile[];
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ media }) => {
  const [selected, setSelected] = useState<number | null>(null);

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-600 gap-2">
        <ImageIcon className="w-7 h-7" />
        <span className="text-sm">Нет медиафайлов</span>
      </div>
    );
  }

  const current = selected !== null ? media[selected] : null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {media.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => setSelected(idx)}
            className="relative aspect-video bg-slate-800 rounded-xl overflow-hidden cursor-pointer group border border-slate-700 hover:border-slate-500 transition-colors"
          >
            {item.type === 'image' ? (
              <img src={item.url} alt={item.label ?? ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="w-8 h-8 text-slate-400" />
              </div>
            )}
            {item.label && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-xs text-white truncate">{item.label}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selected !== null && current && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setSelected(null)}>
          <button className="absolute top-4 right-4 text-white/60 hover:text-white p-2" onClick={() => setSelected(null)}>
            <X className="w-6 h-6" />
          </button>
          {selected > 0 && (
            <button className="absolute left-4 text-white/60 hover:text-white p-3 z-10" onClick={(e) => { e.stopPropagation(); setSelected(s => (s ?? 1) - 1); }}>
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          <div className="max-w-5xl w-full px-20" onClick={(e) => e.stopPropagation()}>
            {current.type === 'image' ? (
              <img src={current.url} alt={current.label ?? ''} className="w-full object-contain rounded-xl" />
            ) : (
              <video src={current.url} controls className="w-full rounded-xl" />
            )}
            {current.label && <p className="text-center text-white/50 text-sm mt-3">{current.label}</p>}
          </div>
          {selected < media.length - 1 && (
            <button className="absolute right-4 text-white/60 hover:text-white p-3 z-10" onClick={(e) => { e.stopPropagation(); setSelected(s => (s ?? 0) + 1); }}>
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-sm">{selected + 1} / {media.length}</div>
        </div>
      )}
    </>
  );
};

export default MediaGallery;

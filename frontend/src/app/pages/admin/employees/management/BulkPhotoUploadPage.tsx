import React, { useState } from "react";
import { Image as ImageIcon, UploadCloud, X, RefreshCw, CheckCircle2, User } from "lucide-react";

interface UploadedPhoto {
  id: string;
  name: string;
  size: number;
  status: "pending" | "uploading" | "success" | "error";
  preview: string;
}

export function BulkPhotoUploadPage() {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos: UploadedPhoto[] = Array.from(e.target.files).map((file, index) => ({
        id: `photo-${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        status: "pending",
        preview: URL.createObjectURL(file)
      }));
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const removePhoto = (id: string) => {
    setPhotos(photos.filter(p => p.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-500" />
            Bulk Photo Upload
          </h2>
          <p className="text-sm text-muted-foreground">Match photos with employees using Employee ID as the filename (e.g., EMP001.jpg).</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            disabled={photos.length === 0}
            className="px-4 py-2 bg-foreground text-background text-sm font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
          >
            Start Upload
          </button>
        </div>
      </div>

      {/* Upload Box */}
      <div className="border-2 border-dashed border-border rounded-2xl p-8 bg-card hover:bg-secondary/20 transition-all text-center space-y-4">
        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto">
          <UploadCloud className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold">Drop images here or click to browse</p>
          <p className="text-xs text-muted-foreground">Supports JPG, PNG (Max 5MB per file)</p>
        </div>
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          id="photo-upload" 
          onChange={handleFileSelect}
        />
        <label 
          htmlFor="photo-upload"
          className="inline-block px-5 py-2 border border-border text-sm font-medium rounded-lg cursor-pointer hover:bg-secondary transition-colors"
        >
          Select Photos
        </label>
      </div>

      {/* Preview Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square bg-background border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <img src={photo.preview} alt={photo.name} className="w-full h-full object-cover" />
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <button 
                  onClick={() => removePhoto(photo.id)}
                  className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-[10px] text-white font-medium truncate">{photo.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-[9px] text-white/80">Pending match</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground bg-card border border-border border-dashed rounded-2xl">
          <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
          <p className="text-sm">No photos selected for upload</p>
        </div>
      )}
    </div>
  );
}

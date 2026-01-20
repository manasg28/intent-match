import { useRef } from 'react';
import { UserPhoto } from '@/types/user';
import { Plus, X } from 'lucide-react';

interface PhotoUploadProps {
  photos: UserPhoto[];
  onPhotosChange: (photos: UserPhoto[]) => void;
  onFileSelect: (file: File, order: number) => Promise<string>;
  maxPhotos?: number;
  isUploading?: boolean;
}

const PhotoUpload = ({
  photos,
  onPhotosChange,
  onFileSelect,
  maxPhotos = 3,
  isUploading = false,
}: PhotoUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const order = photos.length;
    const url = await onFileSelect(file, order);

    const newPhoto: UserPhoto = {
      id: `photo_${Date.now()}`,
      url,
      order,
    };

    onPhotosChange([...photos, newPhoto]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (id: string) => {
    const updated = photos
      .filter((p) => p.id !== id)
      .map((p, idx) => ({ ...p, order: idx }));
    onPhotosChange(updated);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add up to {maxPhotos} photos. Real photos only.
      </p>

      <div className="grid grid-cols-3 gap-3">
        {/* Existing photos */}
        {photos.map((photo) => (
          <div key={photo.id} className="relative aspect-[3/4]">
            <div className="photo-frame h-full w-full">
              <img
                src={photo.url}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <button
              onClick={() => handleRemovePhoto(photo.id)}
              className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background shadow-lifted"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Add photo button */}
        {photos.length < maxPhotos && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex aspect-[3/4] items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 transition-gentle hover:border-muted-foreground hover:bg-secondary/50 disabled:opacity-50"
          >
            {isUploading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            ) : (
              <Plus className="h-6 w-6 text-muted-foreground" />
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default PhotoUpload;


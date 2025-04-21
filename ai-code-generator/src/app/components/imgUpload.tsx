import React from 'react';
import { Camera as CameraIcon, X } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (base64Image: string) => void;
  onRemove: () => void;
  uploadedImage: string | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, onRemove, uploadedImage }) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const toBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      };
      try {
        const base64Image = await toBase64(file);
        onUpload(base64Image);
      } catch (error) {
        console.error('Error processing image upload:', error);
      }
    }
  };

  return (
    <div className="flex items-center">
      {uploadedImage ? (
        <div className="relative">
          <img
            src={uploadedImage}
            alt="Uploaded"
            className="w-20 h-20 object-cover rounded-md"
          />
          <button
            onClick={onRemove}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          <label htmlFor="image-upload" className="flex items-center cursor-pointer text-gray-400">
            <CameraIcon size={20} className="mr-2" />
            <span>Upload Image</span>
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  );
};

export default ImageUpload;
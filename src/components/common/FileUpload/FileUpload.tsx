import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { validateImageFile, createImagePreview } from '../../../utils/imageUtils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  currentImage?: string;
  error?: string;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  currentImage,
  error,
  disabled = false
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return;
    }

    try {
      const previewUrl = await createImagePreview(file);
      setPreview(previewUrl);
      onFileSelect(file);
    } catch (error) {
      console.error('Error creating preview:', error);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.svg']
    },
    maxFiles: 1,
    disabled
  });

  const handleRemove = () => {
    setPreview(null);
    onFileRemove();
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
            <img
              src={preview}
              alt="Business Logo Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive || dragActive
              ? 'border-blue-400 bg-blue-50'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} disabled={disabled} />
          <div className="space-y-4">
            <div className="flex justify-center">
              {error ? (
                <AlertCircle className="w-12 h-12 text-red-400" />
              ) : (
                <ImageIcon className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isDragActive ? 'Drop your logo here' : 'Upload Business Logo'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, SVG up to 5MB
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={disabled}
            >
              <Upload className="w-4 h-4" />
              Choose File
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
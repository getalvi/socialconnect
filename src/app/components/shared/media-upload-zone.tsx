'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileImage, FileVideo, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

interface UploadResult {
  id: string;
  url: string;
  thumbnailUrl?: string;
  filename: string;
  mimeType: string;
  size: number;
}

interface MediaUploadZoneProps {
  onUploadComplete: (files: UploadResult[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  className?: string;
}

export function MediaUploadZone({
  onUploadComplete,
  accept = 'image/*,video/*',
  multiple = true,
  maxSize = 50 * 1024 * 1024, // 50MB
  className,
}: MediaUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const acceptedTypes = accept.split(',').map((t) => t.trim());
    const matchesType = acceptedTypes.some((type) => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type;
    });
    if (!matchesType) {
      toast.error(`File type "${file.type}" is not supported`);
      return false;
    }
    if (file.size > maxSize) {
      toast.error(`File "${file.name}" exceeds maximum size of ${Math.round(maxSize / 1024 / 1024)}MB`);
      return false;
    }
    return true;
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(validateFile);
    if (validFiles.length === 0) return;

    setUploading(true);
    setProgress(0);

    try {
      const results: UploadResult[] = [];
      for (let i = 0; i < validFiles.length; i++) {
        const formData = new FormData();
        formData.append('file', validFiles[i]);
        const result = await apiClient.upload<UploadResult>('/media/upload', formData);
        results.push(result);
        setProgress(Math.round(((i + 1) / validFiles.length) * 100));
      }
      toast.success(`Uploaded ${results.length} file(s) successfully`);
      onUploadComplete(results);
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [maxSize, accept, onUploadComplete]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleClick = () => inputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50',
        uploading && 'pointer-events-none',
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        disabled={uploading}
      />

      {uploading ? (
        <div className="space-y-3">
          <Loader2 className="h-10 w-10 text-primary mx-auto animate-spin" />
          <div>
            <p className="text-sm font-medium">Uploading...</p>
            <p className="text-sm text-muted-foreground">{progress}%</p>
          </div>
          <div className="w-full bg-muted rounded-full h-2 max-w-xs mx-auto">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <FileImage className="h-8 w-8 text-muted-foreground" />
            <FileVideo className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Drag & drop files here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports images and videos up to {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
          <Button variant="outline" size="sm" type="button">
            <Upload className="h-4 w-4 mr-2" />
            Select Files
          </Button>
        </div>
      )}
    </div>
  );
}
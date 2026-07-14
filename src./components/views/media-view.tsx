'use client';

import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Upload, Trash2, Image as ImageIcon, X, Search } from 'lucide-react';
import { format } from 'date-fns';

export function MediaView() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['media', search],
    queryFn: () => api.get(`/api/media?limit=50${search ? `&search=${search}` : ''}`),
  });

  const items = (data?.data as Record<string, unknown>)?.items as Array<Record<string, unknown>> | undefined;

  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.upload('/api/upload', file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['media'] }); toast.success('Media uploaded'); },
    onError: () => toast.error('Upload failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/upload/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['media'] }); setSelected(null); toast.success('Media deleted'); },
  });

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => uploadMutation.mutate(file));
  }, [uploadMutation]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-muted-foreground text-sm">Upload and manage your media files</p>
        </div>
        <Button onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4 mr-1.5" /> Upload</Button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      >
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Drag and drop images here, or click Upload</p>
        <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF, WebP up to 10MB</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-8" placeholder="Search media..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
        </div>
      ) : items && items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <Card key={String(item.id)} className="group cursor-pointer overflow-hidden" onClick={() => setSelected(item)}>
              <div className="aspect-square relative bg-muted">
                {item.thumbnailUrl ? (
                  <img src={String(item.thumbnailUrl)} alt="" className="w-full h-full object-cover" />
                ) : item.url ? (
                  <img src={String(item.url)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-2 opacity-0 group-hover:opacity-100">
                  <span className="text-white text-xs truncate">{String(item.originalName)}</span>
                </div>
              </div>
              <CardContent className="p-2">
                <p className="text-xs text-muted-foreground truncate">{String(item.originalName)}</p>
                <p className="text-[10px] text-muted-foreground">{(Number(item.size) / 1024).toFixed(0)} KB</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <ImageIcon className="h-10 w-10 mx-auto mb-2" />
          <p>No media files yet</p>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected ? String(selected.originalName) : ''}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              {selected.url && <img src={String(selected.url)} alt="" className="w-full max-h-96 object-contain bg-muted rounded-lg" />}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Type:</span> {String(selected.mimeType)}</div>
                <div><span className="text-muted-foreground">Size:</span> {(Number(selected.size) / 1024).toFixed(0)} KB</div>
                <div><span className="text-muted-foreground">Dimensions:</span> {selected.width}x{String(selected.height)}</div>
                <div><span className="text-muted-foreground">Uploaded:</span> {format(new Date(String(selected.createdAt)), 'MMM d, yyyy')}</div>
              </div>
              {selected.analysisResult && (
                <div>
                  <p className="text-sm font-medium mb-1">AI Analysis</p>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40">{JSON.stringify(JSON.parse(String(selected.analysisResult)), null, 2)}</pre>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="destructive" onClick={() => deleteMutation.mutate(String(selected.id))}>
                  <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
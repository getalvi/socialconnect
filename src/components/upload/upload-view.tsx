'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { UploadCloud, ImageIcon, Wand2, Sparkles, CheckCircle2, ArrowRight, Eye, Palette, Crop, ZoomIn, Tag, X, Loader2 } from 'lucide-react';

const enhancementOptions = [
  { id: 'bg_removal', label: 'Background Removal', icon: Crop, description: 'Remove background for clean product shots' },
  { id: 'upscale', label: 'Upscale 2x', icon: ZoomIn, description: 'Increase resolution without losing quality' },
  { id: 'resize_ig', label: 'Instagram (1:1)', icon: Crop, description: 'Square crop optimized for Instagram' },
  { id: 'resize_fb', label: 'Facebook (1200x630)', icon: Crop, description: 'Optimal Facebook post dimensions' },
  { id: 'resize_pin', label: 'Pinterest (1000x1500)', icon: Crop, description: 'Pinterest pin format' },
  { id: 'resize_li', label: 'LinkedIn (1200x627)', icon: Crop, description: 'LinkedIn post dimensions' },
  { id: 'resize_tt', label: 'TikTok (1080x1920)', icon: Crop, description: 'TikTok vertical format' },
  { id: 'branding', label: 'Add Branding', icon: Tag, description: 'Add logo/watermark to images' },
];

const mockAnalysisResult = {
  product: 'Premium Leather Handbag',
  category: 'Fashion & Accessories',
  niche: 'Luxury Leather Goods',
  audience: 'Professional Women 25-45',
  quality: { overall: 85, clarity: 92, lighting: 78, composition: 88, color: 82 },
  tags: ['leather', 'handbag', 'luxury', 'fashion', 'professional', 'artisan', 'handcrafted', 'brown'],
};

export default function UploadView() {
  const { uploadStep, setUploadStep, selectedMedia, addSelectedMedia, removeSelectedMedia, clearSelectedMedia, setGeneratedContent } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedEnhancements, setSelectedEnhancements] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Simulate adding files
    addSelectedMedia({
      id: `m-${Date.now()}`,
      originalUrl: '/uploads/placeholder.jpg',
      originalName: 'product-photo.jpg',
      mimeType: 'image/jpeg',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    });
  }, [addSelectedMedia]);

  const handleFileSelect = () => {
    addSelectedMedia({
      id: `m-${Date.now() + 1}`,
      originalUrl: '/uploads/placeholder2.jpg',
      originalName: 'product-photo-2.jpg',
      mimeType: 'image/jpeg',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    });
  };

  const toggleEnhancement = (id: string) => {
    setSelectedEnhancements(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const simulateAI = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (uploadStep === 'upload') setUploadStep('analyze');
      else if (uploadStep === 'analyze') setUploadStep('enhance');
      else if (uploadStep === 'enhance') setUploadStep('generate');
      else if (uploadStep === 'generate') {
        setGeneratedContent({
          caption: 'Elevate your everyday style with our premium leather collection. ✨',
          professional: 'Introducing our premium leather collection designed for the modern professional.',
          friendly: 'Hey friends! Check out our gorgeous new leather goodies! 🥰',
          luxury: 'Exquisite craftsmanship meets contemporary design in our premium leather collection.',
          emoji: 'New leather collection just dropped! 🔥👜✨ #LuxuryLifestyle',
          instagram: 'New leather collection just dropped! 🔥 Handcrafted with premium materials ✨ #NewArrival',
          hashtags: ['#PremiumLeather', '#Handcrafted', '#LuxuryFashion', '#NewArrival', '#SustainableFashion', '#BangladeshFashion'],
        });
        setUploadStep('review');
      }
    }, 2000);
  };

  const steps = [
    { id: 'upload', label: 'Upload', icon: UploadCloud },
    { id: 'analyze', label: 'Analyze', icon: Eye },
    { id: 'enhance', label: 'Enhance', icon: Palette },
    { id: 'generate', label: 'Generate', icon: Wand2 },
    { id: 'review', label: 'Review', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === uploadStep);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Step Progress */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          return (
            <React.Fragment key={step.id}>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : isCurrent ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-muted-foreground'}
              `}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{step.label}</span>
                {isCompleted && <CheckCircle2 className="w-3 h-3" />}
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className={`w-4 h-4 ${index < currentStepIndex ? 'text-emerald-400' : 'text-muted-foreground/30'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      {uploadStep === 'upload' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
              ${isDragging ? 'border-emerald-500 bg-emerald-500/10' : 'border-border/50 hover:border-emerald-500/50 hover:bg-muted/30'}
            `}
          >
            <UploadCloud className={`w-16 h-16 mx-auto mb-4 transition-colors ${isDragging ? 'text-emerald-400' : 'text-muted-foreground'}`} />
            <h3 className="text-lg font-semibold text-foreground mb-2">Drop your images here</h3>
            <p className="text-sm text-muted-foreground mb-4">Support JPG, PNG, WebP up to 10MB each</p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={handleFileSelect} className="bg-emerald-600 hover:bg-emerald-700">
                <ImageIcon className="w-4 h-4 mr-2" />
                Browse Files
              </Button>
              <Button variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                <Sparkles className="w-4 h-4 mr-2" />
                Collect from Store
              </Button>
            </div>
          </div>

          {/* Selected Files */}
          {selectedMedia.length > 0 && (
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Selected Images ({selectedMedia.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {selectedMedia.map((media) => (
                    <div key={media.id} className="relative group rounded-lg overflow-hidden bg-muted/30 aspect-square">
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                      <button
                        onClick={() => removeSelectedMedia(media.id)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                        <p className="text-[10px] text-white truncate">{media.originalName}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={simulateAI} className="bg-emerald-600 hover:bg-emerald-700" disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                    Analyze Images
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {uploadStep === 'analyze' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-emerald-500/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-400" />
                AI Image Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Analysis Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Product Identified</p>
                    <p className="text-sm font-semibold text-foreground">{mockAnalysisResult.product}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                    <p className="text-sm font-semibold text-foreground">{mockAnalysisResult.category}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Niche</p>
                    <p className="text-sm font-semibold text-foreground">{mockAnalysisResult.niche}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Target Audience</p>
                    <p className="text-sm font-semibold text-foreground">{mockAnalysisResult.audience}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Quality Analysis</p>
                  {Object.entries(mockAnalysisResult.quality).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground capitalize">{key}</span>
                        <span className="text-xs font-medium text-foreground">{value}%</span>
                      </div>
                      <Progress value={value} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Tags */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">AI Detected Tags</p>
                <div className="flex flex-wrap gap-2">
                  {mockAnalysisResult.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={simulateAI} className="bg-emerald-600 hover:bg-emerald-700" disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Palette className="w-4 h-4 mr-2" />}
                  Enhance Images
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {uploadStep === 'enhance' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="w-5 h-5 text-emerald-400" />
                Image Enhancement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Select enhancements to apply to your images. AI will optimize for each platform.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {enhancementOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedEnhancements.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleEnhancement(option.id)}
                      className={`p-4 rounded-lg border text-left transition-all
                        ${isSelected ? 'border-emerald-500 bg-emerald-500/10' : 'border-border/50 hover:border-emerald-500/30 hover:bg-muted/30'}
                      `}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                      <p className="text-sm font-medium text-foreground">{option.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={() => setUploadStep('analyze')}>Back</Button>
                <Button onClick={simulateAI} className="bg-emerald-600 hover:bg-emerald-700" disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                  Generate Content
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {uploadStep === 'generate' && (
        <div className="max-w-4xl mx-auto">
          <Card className="border-emerald-500/30">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">AI is generating your content...</h3>
              <p className="text-sm text-muted-foreground">Analyzing trends, crafting captions, researching hashtags</p>
              {isProcessing && (
                <div className="mt-6 space-y-2 max-w-xs mx-auto">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Trend research complete
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Captions generated
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" /> Generating hashtags...
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Auto-advance */}
          {simulateAI()}
        </div>
      )}

      {uploadStep === 'review' && (
        <ReviewStep />
      )}
    </div>
  );
}

function ReviewStep() {
  const { generatedContent, setUploadStep } = useAppStore();

  if (!generatedContent) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card className="border-emerald-500/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Content Generated Successfully
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="instagram" className="w-full">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="instagram">📷 Instagram</TabsTrigger>
              <TabsTrigger value="facebook">📘 Facebook</TabsTrigger>
              <TabsTrigger value="linkedin">💼 LinkedIn</TabsTrigger>
              <TabsTrigger value="twitter">🐦 Twitter</TabsTrigger>
              <TabsTrigger value="pinterest">📌 Pinterest</TabsTrigger>
              <TabsTrigger value="threads">🧵 Threads</TabsTrigger>
            </TabsList>

            {['instagram', 'facebook', 'linkedin', 'twitter', 'pinterest', 'threads'].map(platform => (
              <TabsContent key={platform} value={platform}>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {generatedContent[platform as keyof typeof generatedContent] || generatedContent.caption}
                  </p>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Hashtags */}
          {generatedContent.hashtags && (
            <div className="mt-4">
              <p className="text-sm font-medium text-foreground mb-2">Generated Hashtags</p>
              <div className="flex flex-wrap gap-2">
                {generatedContent.hashtags.map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-emerald-500/10 text-emerald-400">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tone Variants */}
          <div className="mt-6">
            <p className="text-sm font-medium text-foreground mb-3">Content Variants</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: 'Professional', content: generatedContent.professional },
                { label: 'Friendly', content: generatedContent.friendly },
                { label: 'Luxury', content: generatedContent.luxury },
                { label: 'Emoji', content: generatedContent.emoji },
              ].map(variant => (
                <div key={variant.label} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-xs font-medium text-emerald-400 mb-1">{variant.label}</p>
                  <p className="text-sm text-foreground">{variant.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setUploadStep('enhance')}>Regenerate</Button>
            <div className="flex gap-2">
              <Button variant="outline" className="border-amber-500/30 text-amber-400" onClick={() => setUploadStep('schedule')}>
                Save as Draft
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setUploadStep('schedule')}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve & Schedule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

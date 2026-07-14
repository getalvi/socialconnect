'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, RefreshCw, Save, Loader2, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

interface AiGenerationCardProps {
  title: string;
  endpoint: string;
  placeholder?: string;
  model?: string;
  extraFields?: React.ReactNode;
  resultRenderer?: (result: unknown) => React.ReactNode;
  defaultResult?: string;
}

interface AiGenerationResult {
  result?: string;
  data?: unknown;
  model?: string;
  tokensUsed?: number;
  latencyMs?: number;
}

export function AiGenerationCard({
  title,
  endpoint,
  placeholder = 'Enter your input...',
  model: defaultModel,
  extraFields,
  resultRenderer,
  defaultResult,
}: AiGenerationCardProps) {
  const [input, setInput] = useState('');
  const [model, setModel] = useState(defaultModel || 'auto');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiGenerationResult | null>(null);

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error('Please enter some input');
      return;
    }
    setLoading(true);
    try {
      const payload: Record<string, unknown> = { input, model };
      const data = await apiClient.post<AiGenerationResult>(endpoint, payload);
      setResult(data);
    } catch {
      // Error handled by api-client
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleCopy = () => {
    const text = result?.result || (result?.data ? JSON.stringify(result.data, null, 2) : '');
    if (text) {
      navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    }
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      await apiClient.post('/ai/save-result', result);
      toast.success('Result saved');
    } catch {
      // Error handled by api-client
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Model</Label>
          <Select value={model} onValueChange={setModel} disabled={loading}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto (Best Available)</SelectItem>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
              <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
              <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
              <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Input</Label>
          <Textarea
            placeholder={placeholder}
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
        </div>

        {extraFields}

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Zap className="mr-2 h-4 w-4" />
          )}
          Generate
        </Button>

        {result && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label>Result</Label>
              <div className="flex gap-1">
                {result.model && (
                  <Badge variant="outline" className="text-xs">
                    {result.model}
                  </Badge>
                )}
                {result.tokensUsed !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    {result.tokensUsed} tokens
                  </Badge>
                )}
                {result.latencyMs !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    {result.latencyMs}ms
                  </Badge>
                )}
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm min-h-[100px]">
              {resultRenderer ? resultRenderer(result.data || result.result) : (result.result || defaultResult || JSON.stringify(result.data, null, 2))}
            </div>
          </div>
        )}
      </CardContent>
      {result && (
        <CardFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="mr-2 h-3.5 w-3.5" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="mr-2 h-3.5 w-3.5" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={loading}>
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
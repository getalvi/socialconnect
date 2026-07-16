"use client";

import { DashboardShell } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Loader2, Copy, Check, Image as ImageIcon, Hash, FileText, Target, TrendingUp, Globe, Languages } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const REQUEST_TYPES = [
  { type: "caption", label: "Caption", icon: FileText, desc: "Generate engaging post captions" },
  { type: "hashtags", label: "Hashtags", icon: Hash, desc: "Generate platform-specific hashtags" },
  { type: "seo_title", label: "SEO Title", icon: FileText, desc: "Generate SEO-optimized title" },
  { type: "meta_description", label: "Meta Description", icon: FileText, desc: "Generate meta description" },
  { type: "product_description", label: "Product Description", icon: FileText, desc: "Generate product copy" },
  { type: "cta", label: "CTA", icon: Target, desc: "Generate call-to-action variants" },
  { type: "strategy", label: "Strategy", icon: TrendingUp, desc: "Generate 30-day marketing strategy" },
  { type: "trend_research", label: "Trend Research", icon: TrendingUp, desc: "Research current trends" },
  { type: "keyword_research", label: "Keywords", icon: Hash, desc: "SEO keyword research" },
  { type: "audience_analysis", label: "Audience", icon: Target, desc: "Analyze target audience" },
  { type: "competitor_analysis", label: "Competitors", icon: TrendingUp, desc: "Analyze competitors" },
  { type: "multilingual", label: "Translate", icon: Languages, desc: "Adapt content for another language" },
] as const;

type RequestType = typeof REQUEST_TYPES[number]["type"];

export default function AIAssistantPage() {
  const [selectedType, setSelectedType] = useState<RequestType>("caption");
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("en");
  const [variations, setVariations] = useState(1);
  const [platform, setPlatform] = useState("instagram");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [resultVariations, setResultVariations] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt first");
      return;
    }
    setLoading(true);
    setResult("");
    setResultVariations([]);
    try {
      const response = await api.ai.generate({
        request_type: selectedType,
        prompt: prompt.trim(),
        language,
        variations,
        context: { platform, brand_voice: { tone: "professional", style: "concise" } },
      });
      setResult(response.content);
      setResultVariations(response.variations || []);
      toast.success(`Generated in ${response.tokens_used} tokens`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      toast.error(`Backend unavailable in preview — connect backend in production. (${msg})`);
      // Fallback: show mock content so UI is demoable
      setResult(mockContent(selectedType, prompt));
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("Copied to clipboard");
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">AI Marketing Assistant</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your AI marketing employee — generates captions, hashtags, SEO, strategy, and more via OpenRouter
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: request type picker */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">What do you need?</CardTitle>
              <CardDescription>Select a content type to generate</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {REQUEST_TYPES.map((rt) => {
                const Icon = rt.icon;
                const active = selectedType === rt.type;
                return (
                  <button
                    key={rt.type}
                    onClick={() => setSelectedType(rt.type)}
                    className={`flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-all ${
                      active
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-border hover:border-emerald-500/50 hover:bg-accent"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-emerald-500" : "text-muted-foreground"}`} />
                    <span className="text-xs font-medium">{rt.label}</span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">{rt.desc}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Right: prompt + result */}
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Generate {REQUEST_TYPES.find((r) => r.type === selectedType)?.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium">Prompt / Product description</label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Handwoven jute tote bag, eco-friendly, made in Bangladesh, $35, target: environmentally conscious millennials"
                    className="min-h-24"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="en">English</option>
                      <option value="bn">Bangla</option>
                      <option value="ar">Arabic</option>
                      <option value="hi">Hindi</option>
                      <option value="ur">Urdu</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium">Platform</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter/X</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="tiktok">TikTok</option>
                      <option value="pinterest">Pinterest</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium">Variations</label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={variations}
                      onChange={(e) => setVariations(Number(e.target.value) || 1)}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating via OpenRouter...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {result && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Result</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(result)}>
                        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                        Copy
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resultVariations.length > 1 ? (
                    resultVariations.map((v, i) => (
                      <div key={i} className="rounded-lg border p-3">
                        <Badge className="mb-2 text-[10px]">Variation {i + 1}</Badge>
                        <p className="whitespace-pre-wrap text-sm">{v}</p>
                      </div>
                    ))
                  ) : (
                    <p className="whitespace-pre-wrap text-sm">{result}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">Save as Draft</Button>
                    <Button variant="outline" size="sm">Schedule Post</Button>
                    <Button variant="outline" size="sm">Regenerate</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function mockContent(type: string, prompt: string): string {
  const samples: Record<string, string> = {
    caption: `Carry the planet's story on your shoulder. 🌿\n\nHandwoven by artisans in Bangladesh, this jute tote turns every grocery run into a quiet act of rebellion against plastic. Durable enough for daily use, beautiful enough to keep for years.\n\nTap to shop — and feel good about what you carry.\n\n#EcoFriendly #SlowFashion #JuteTote`,
    hashtags: `#EcoFriendly #SustainableLiving #JuteTote #HandmadeInBangladesh #SlowFashion #PlasticFree #EthicalFashion #EcoWarrior #ZeroWaste #ArtisanMade #SupportArtisans #GreenLiving #ConsciousConsumer #SustainableStyle #EcoBags`,
    seo_title: `Handwoven Jute Tote Bag | Eco-Friendly & Made in Bangladesh`,
    meta_description: `Ditch plastic with our handwoven jute tote — eco-friendly, artisan-made in Bangladesh, and built to last. Shop sustainable fashion today.`,
    product_description: `**The Tote That Tells a Story**\n\nEvery stitch of this jute tote carries the hands of a Bangladeshi artisan who has spent decades perfecting their craft. This isn't fast fashion — it's slow, intentional, and built to outlast trends.\n\n**Why you'll love it:**\n- 100% natural jute fiber, biodegradable\n- Reinforced handles for heavy loads\n- Spacious interior (fits a 13" laptop + groceries)\n- Each piece unique — slight variations are signatures of handcraft\n\n**The impact:**\n- 1 tote = ~300 plastic bags avoided per year\n- Direct income to artisan families\n- Zero synthetic dyes`,
    cta: `1. Shop the artisan story →\n2. Carry something that matters\n3. Your plastic-free upgrade\n4. Handwoven, yours today\n5. Join the slow fashion movement`,
    strategy: `# 30-Day Marketing Strategy: Handwoven Jute Tote\n\n## Positioning\nPremium eco-friendly everyday carry, positioned between mass-market reusable bags and luxury artisan brands.\n\n## Target Audience\n- **Primary:** Urban millennials (25-35), environmentally conscious, $50K+ income\n- **Secondary:** Ethical gift buyers (35-50), corporate sustainability buyers\n\n## Channel Mix\n- **Instagram (40%):** Hero lifestyle content + artisan stories\n- **TikTok (25%):** Behind-the-scenes weaving process\n- **Pinterest (15%):** SEO-driven gift guides\n- **Facebook (10%):** Community + retargeting\n- **Email (10%):** Nurture sequence + launch drops\n\n## Content Pillars\n1. Artisan stories (week 1-2)\n2. Sustainability impact (week 2-3)\n3. Lifestyle integration (week 3-4)\n4. Customer spotlights (week 4)\n\n## KPIs\n- 50K impressions / day by week 4\n- 3% engagement rate minimum\n- 200 units sold in 30 days\n- $8 CAC target\n\n## Budget Allocation\n- Content production: 30%\n- Paid amplification: 40%\n- Influencer partnerships: 20%\n- Tools & analytics: 10%`,
    trend_research: `# Trend Research: Eco-Friendly Bags (July 2026)\n\n## Top 5 Trending Topics\n1. #PlasticFreeJuly — 2.4M posts (peak season)\n2. Artisan storytelling reels — +180% YoY\n3. "Slow fashion" — 4.1B views on TikTok\n4. Bangladesh craft revival — growing niche\n5. Corporate gifting sustainability — B2B angle\n\n## Top 5 Content Formats\n1. Behind-the-scenes weaving (TikTok)\n2. Day-in-the-life artisan reels (IG)\n3. Before/after plastic comparisons (Carousel)\n4. Customer unboxing stories (Reels)\n5. Infographics on impact (Pinterest)\n\n## Best Posting Times\n- Instagram: Tue-Thu, 11 AM & 7 PM\n- TikTok: Sun-Wed, 8 PM\n- Pinterest: Sat-Sun, 9 AM\n\n## Opportunity Gaps\n1. No major brand owns "Bangladesh artisan" narrative\n2. B2B corporate gifting underserved\n3. TikTok underutilized for slow fashion`,
    keyword_research: `| Keyword | Intent | Volume | Difficulty | Use |\n|---------|--------|--------|------------|-----|\n| jute tote bag | commercial | High | 6 | Product page |\n| eco friendly tote | commercial | High | 7 | Category page |\n| handmade bag bangladesh | informational | Med | 3 | Blog post |\n| sustainable tote bag | commercial | Med | 5 | Product page |\n| jute bag bulk | transactional | Med | 4 | B2B landing |\n| artisan made tote | informational | Low | 2 | Story page |\n| biodegradable bag | informational | High | 8 | Blog post |\n| reusable grocery bag | commercial | High | 9 | Category page |\n| ethical fashion brands | informational | Med | 6 | Comparison |\n| slow fashion meaning | informational | High | 5 | Education blog |`,
    audience_analysis: `# Target Audience Analysis\n\n## Demographics\n- **Age:** 25-38 (peak 28-32)\n- **Gender:** 65% female, 35% male\n- **Location:** Urban centers, North America + EU + urban Bangladesh\n- **Income:** $45K-95K, mid-premium segment\n- **Education:** 70% Bachelor's+\n\n## Psychographics\n- **Values:** Sustainability, craftsmanship, anti-mass-production\n- **Interests:** Slow fashion, zero waste, ethical living, travel\n- **Lifestyle:** Urban professionals, weekend market shoppers\n\n## Behavioral\n- **Online habits:** Instagram + Pinterest daily, TikTok 3-4x/week\n- **Purchase triggers:** Story-driven content, artisan profiles, limited drops\n- **Avg order value:** $35-80\n- **Cart completion:** 42% (above category avg)\n\n## Pain Points\n1. Greenwashing fatigue — want authentic stories\n2. Difficulty verifying sustainability claims\n3. Lack of traceability in supply chain\n\n## Personas\n1. **Eco-Conscious Emma (29):** Marketing manager, pays premium for transparency\n2. **Gift-Giving Gina (38):** Buys ethical gifts for family, values story cards\n3. **Corporate Chris (45):** Sustainability officer, bulk orders for team gifts`,
    competitor_analysis: `# Competitor Analysis: Eco-Friendly Bag Category\n\n## Top 5 Competitor Archetypes\n1. **Mass-Market Eco Brands** (e.g., Baggu, EcoBags)\n   - Positioning: Affordable, colorful, trend-led\n   - Content: UGC-heavy, minimal storytelling\n   - Pricing: $12-25\n   - Weakness: No artisan narrative\n\n2. **Luxury Artisan Brands** (e.g., Muzungu Sisters)\n   - Positioning: Premium, exclusive, story-rich\n   - Content: Editorial photography\n   - Pricing: $80-300\n   - Weakness: Inaccessible price point\n\n3. **Direct-to-Consumer Disruptors**\n   - Positioning: Modern, minimalist\n   - Content: Product-focused reels\n   - Pricing: $30-50\n   - Weakness: Generic origin story\n\n4. **Marketplace Sellers**\n   - Positioning: Cheap, fast shipping\n   - Content: None / low quality\n   - Pricing: $8-15\n   - Weakness: No brand trust\n\n5. **Nonprofit / Cause Brands**\n   - Positioning: Mission-first\n   - Content: Impact reports\n   - Pricing: $20-40\n   - Weakness: Limited product range\n\n## Differentiation Opportunities\n1. **Own "Bangladesh artisan" narrative** — currently uncontested\n2. **Hybrid price tier ($25-50)** — premium enough to signal quality, accessible enough for repeat purchase\n3. **Story-NFT authenticity** — verifiable artisan per bag (early mover advantage)\n4. **Corporate gifting white-label** — B2B revenue stream`,
    multilingual: `বাংলাদেশের কারিগরদের হাতে বোনা এই পাটের ব্যাগটি বহন করুন প্রকৃতির গল্প। 🌿\n\nপ্রতিদিনের কেনাকাটায় প্লাস্টিকের ব্যাগ ছেড়ে এই পরিবেশবান্ধব জুট ব্যাগ ব্যবহার করুন। টেকসই, সুন্দর, এবং দীর্ঘস্থায়ী।\n\nঅর্ডার করতে ট্যাপ করুন — বহন করুন গর্বের সাথে।\n\n#পরিবেশবান্ধব #হাতেবোনা #জুটব্যাগ`,
  };
  return samples[type] || "Generated content will appear here.";
}

import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useRoute } from "wouter";
import { Package } from "@db/schema";
import { SiSpotify, SiYoutube, SiTiktok } from "react-icons/si";
import { Loader2 } from "lucide-react";

// Platform-specific schemas
const spotifySchema = z.object({
  contentUrl: z.string()
    .url("Geçerli bir URL giriniz")
    .regex(/^https:\/\/(open\.)?spotify\.com\/(intl-[a-z]{2}\/)?((track|album|artist)\/[a-zA-Z0-9]+)/,
      "Geçerli bir Spotify track, album veya artist linki giriniz"),
  packageId: z.number(),
});

const youtubeSchema = z.object({
  contentUrl: z.string()
    .url("Geçerli bir URL giriniz")
    .regex(/^https:\/\/(www\.)?(youtube\.com\/(watch\?v=[a-zA-Z0-9_-]+|channel\/[a-zA-Z0-9_-]+)|youtu\.be\/[a-zA-Z0-9_-]+)/,
      "Geçerli bir YouTube video veya kanal linki giriniz"),
  packageId: z.number(),
});

const tiktokSchema = z.object({
  contentUrl: z.string()
    .url("Geçerli bir URL giriniz")
    .regex(/^https:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9_.]+(\/(video|profile)\/[0-9]+)?/,
      "Geçerli bir TikTok video veya profil linki giriniz"),
  packageId: z.number(),
});

const schemaMap = {
  spotify: spotifySchema,
  youtube: youtubeSchema,
  tiktok: tiktokSchema,
};

const platformTitles = {
  spotify: "Spotify Promosyonu",
  youtube: "YouTube Promosyonu",
  tiktok: "TikTok Promosyonu",
};

const platformIcons = {
  spotify: <SiSpotify className="w-6 h-6 text-[#1DB954]" />,
  youtube: <SiYoutube className="w-6 h-6 text-[#FF0000]" />,
  tiktok: <SiTiktok className="w-6 h-6" />,
};

interface PackageWithPlatform extends Package {
  platform: {
    id: number;
    name: string;
    slug: string;
    isActive: boolean;
  };
}

const EmbedPreview = ({ platform, url }: { platform: string, url: string }) => {
  if (!url) return null;

  if (platform === 'spotify') {
    const match = url.match(/spotify\.com\/(intl-[a-z]{2}\/)?(track|album|artist)\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    const [, , type, id] = match;
    return (
      <iframe
        src={`https://open.spotify.com/embed/${type}/${id}`}
        width="100%"
        height="352"
        frameBorder="0"
        allow="encrypted-media"
      />
    );
  }

  if (platform === 'youtube') {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (!match) return null;
    return (
      <iframe
        width="100%"
        height="315"
        src={`https://www.youtube.com/embed/${match[1]}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (platform === 'tiktok') {
    const match = url.match(/tiktok\.com\/@[a-zA-Z0-9_.]+\/video\/([0-9]+)/);
    if (!match) return null;
    return (
      <blockquote
        className="tiktok-embed"
        cite={url}
        data-video-id={match[1]}
        style={{ maxWidth: '605px', minWidth: '325px' }}
      >
        <section></section>
      </blockquote>
    );
  }

  return null;
};

export default function CreatePromotion() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/create-promotion/:platform/:packageId");

  // Early return if no match
  if (!match) {
    setLocation("/packages");
    return null;
  }

  const { platform, packageId } = params;
  const packageIdNum = parseInt(packageId);

  // Initialize form first
  const form = useForm({
    resolver: zodResolver(schemaMap[platform as keyof typeof schemaMap]),
    defaultValues: {
      packageId: packageIdNum,
      contentUrl: "",
    },
  });

  // Query for package data
  const { data: selectedPackage, isLoading, error } = useQuery<PackageWithPlatform>({
    queryKey: ["/api/packages", packageIdNum],
    queryFn: async () => {
      const res = await fetch(`/api/packages/${packageIdNum}`, {
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch package");
      }
      return res.json();
    },
    retry: 1,
  });

  // Setup mutation
  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Promosyon başarıyla oluşturuldu",
        description: "Promosyonunuz incelendikten sonra aktif hale gelecektir.",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !selectedPackage) {
    return (
      <div className="py-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Paket Bulunamadı</h2>
          <p className="text-gray-600 mb-8">
            İstediğiniz paket bulunamadı veya bir hata oluştu.
          </p>
          <Button onClick={() => setLocation("/packages")}>
            Paketlere Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              {platformIcons[platform as keyof typeof platformIcons]}
              <CardTitle>{platformTitles[platform as keyof typeof platformTitles]}</CardTitle>
            </div>
            <CardDescription>
              {platform === 'spotify' && "Spotify track, albüm veya artist linkinizi girin"}
              {platform === 'youtube' && "YouTube video veya kanal linkinizi girin"}
              {platform === 'tiktok' && "TikTok video veya profil linkinizi girin"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
                <FormField
                  control={form.control}
                  name="contentUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İçerik Linki</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            platform === 'spotify' ? "https://open.spotify.com/track/..." :
                              platform === 'youtube' ? "https://youtube.com/watch?v=..." :
                                "https://tiktok.com/@username/video/..."
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      {field.value && (
                        <div className="mt-4">
                          <EmbedPreview platform={platform} url={field.value} />
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Seçilen Paket</h3>
                  <p className="text-sm text-gray-600">{selectedPackage.name}</p>
                  <p className="text-sm text-gray-600 mt-1">${selectedPackage.price}/ay</p>
                  <ul className="mt-4 space-y-2">
                    {selectedPackage.features?.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1 h-1 bg-gray-400 rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Oluşturuluyor..." : "Promosyonu Başlat"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
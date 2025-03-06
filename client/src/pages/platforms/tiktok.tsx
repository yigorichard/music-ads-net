import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiTiktok } from "react-icons/si";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { Package } from "@db/schema";

interface PackageWithPlatform extends Package {
  platform: {
    id: number;
    name: string;
    slug: string;
    isActive: boolean;
  };
}

export default function TikTokPromotion() {
  const [, setLocation] = useLocation();
  const { data: packages, isLoading } = useQuery<PackageWithPlatform[]>({
    queryKey: ["/api/packages"],
  });

  const tiktokPackages = packages?.filter(pkg => pkg.platform.slug === "tiktok") || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <SiTiktok className="w-12 h-12" />
            <h1 className="text-4xl font-bold">TikTok Promosyon</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            TikTok'ta müzik içeriklerinizi viral hale getirin. Daha fazla kullanıcıya 
            ulaşın ve trend olma şansınızı artırın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Video Promosyonu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                TikTok videolarınızı keşfet sayfasına taşıyın. İzlenme ve etkileşim 
                sayınızı artırarak viral olma şansınızı yükseltin.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" />
                  Keşfet sayfası görünürlüğü
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" />
                  Etkileşim artışı
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" />
                  Viral potansiyeli
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profil Promosyonu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                TikTok profilinizi büyütün. Takipçi sayınızı artırın ve içeriklerinizi
                daha geniş kitlelere ulaştırın.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" />
                  Takipçi artışı
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" />
                  Profil ziyareti
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" />
                  Topluluk etkileşimi
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Promosyon Paketleri</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            İhtiyacınıza en uygun paketi seçin ve hemen promosyona başlayın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiktokPackages.map((pkg) => (
            <Card key={pkg.id} className="border-2 border-black hover:border-black/80">
              <CardHeader>
                <div className="flex items-center gap-2 mb-4">
                  <SiTiktok className="w-5 h-5" />
                  <span className="text-sm font-medium uppercase">TikTok</span>
                </div>
                <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-6">
                  ${pkg.price}
                  <span className="text-sm font-normal text-gray-600">/ay</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {pkg.features?.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-black rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full"
                  onClick={() => setLocation(`/create-promotion/tiktok/${pkg.id}`)}
                >
                  Paketi Seç
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
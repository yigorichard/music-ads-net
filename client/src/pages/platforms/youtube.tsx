import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiYoutube } from "react-icons/si";
import { useLocation } from "wouter";

export default function YouTubePromotion() {
  const [, setLocation] = useLocation();
  const { data: packages } = useQuery<any[]>({
    queryKey: ["/api/packages"],
  });

  const youtubePackages = packages?.filter(pkg => pkg.platform === "youtube") || [];

  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <SiYoutube className="w-12 h-12 text-[#FF0000]" />
            <h1 className="text-4xl font-bold">YouTube Promosyon</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            YouTube'da müzik videolarınızı ve içeriklerinizi geniş kitlelere ulaştırın.
            Organik izlenme ve abone sayınızı artırın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Video Promosyonu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Müzik videolarınızı doğru hedef kitleye ulaştırın. İzlenme sayınızı 
                artırın ve etkileşim oranınızı yükseltin.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-[#FF0000] rounded-full" />
                  Organik izlenme artışı
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-[#FF0000] rounded-full" />
                  Etkileşim (beğeni, yorum)
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-[#FF0000] rounded-full" />
                  Önerilen videolarda görünüm
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kanal Promosyonu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                YouTube kanalınızı büyütün. Abone sayınızı artırın ve içeriklerinizi
                daha fazla kişiye ulaştırın.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-[#FF0000] rounded-full" />
                  Abone artışı
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-[#FF0000] rounded-full" />
                  Kanal görüntülenme
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-[#FF0000] rounded-full" />
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
          {youtubePackages.map((pkg) => (
            <Card key={pkg.id} className="border-2 border-[#FF0000] hover:border-[#FF0000]/80">
              <CardHeader>
                <div className="flex items-center gap-2 mb-4">
                  <SiYoutube className="w-5 h-5 text-[#FF0000]" />
                  <span className="text-sm font-medium uppercase">YouTube</span>
                </div>
                <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-6">
                  ${pkg.price}
                  <span className="text-sm font-normal text-gray-600">/ay</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#FF0000] rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-[#FF0000] hover:bg-[#FF0000]/90"
                  onClick={() => setLocation(`/create-promotion/youtube/${pkg.id}`)}
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

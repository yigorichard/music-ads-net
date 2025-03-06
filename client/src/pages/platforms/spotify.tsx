import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiSpotify } from "react-icons/si";
import { useLocation } from "wouter";

interface PackageWithPlatform {
  id: string;
  name: string;
  price: number;
  features: string[];
  platform: { slug: string; name: string };
}


export default function SpotifyPromotion() {
  const [, setLocation] = useLocation();
  const { data: packages } = useQuery<PackageWithPlatform[]>({
    queryKey: ["/api/packages"],
    queryFn: async () => {
      const res = await fetch("/api/packages");
      if (!res.ok) throw new Error("Failed to fetch packages");
      return res.json();
    },
  });

  const spotifyPackages = packages?.filter(pkg => pkg.platform?.slug === "spotify") || [];

  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <SiSpotify className="w-12 h-12 text-[#1DB954]" />
            <h1 className="text-4xl font-bold">Spotify Promosyon</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Spotify'da müziğinizi milyonlarca dinleyiciye ulaştırın. Organik büyüme ve
            gerçek dinleyici kitlesi oluşturun.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Track Promosyonu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Yeni çıkan şarkınızı doğru hedef kitleye ulaştırın. Çalma listelerine
                eklenme ve organik dinlenme sayısını artırın.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-[#1DB954] rounded-full" />
                  Çalma listelerine eklenme
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-[#1DB954] rounded-full" />
                  Organik dinleyici artışı
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-[#1DB954] rounded-full" />
                  Algoritma desteği
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sanatçı Promosyonu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Sanatçı profilinizi öne çıkarın. Takipçi sayınızı artırın ve daha
                fazla dinleyiciye ulaşın.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-[#1DB954] rounded-full" />
                  Takipçi artışı
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-[#1DB954] rounded-full" />
                  Profil görüntülenme
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-[#1DB954] rounded-full" />
                  Marka bilinirliği
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
          {spotifyPackages.map((pkg) => (
            <Card key={pkg.id} className="border-2 border-[#1DB954] hover:border-[#1DB954]/80">
              <CardHeader>
                <div className="flex items-center gap-2 mb-4">
                  <SiSpotify className="w-5 h-5 text-[#1DB954]" />
                  <span className="text-sm font-medium uppercase">Spotify</span>
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
                      <span className="w-1.5 h-1.5 bg-[#1DB954] rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-[#1DB954] hover:bg-[#1DB954]/90"
                  onClick={() => setLocation(`/create-promotion/spotify/${pkg.id}`)}
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
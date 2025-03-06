import Hero from "@/components/marketing/hero";
import PackageCard from "@/components/marketing/package-card";
import NewsCard from "@/components/news/news-card";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package } from "@db/schema";
import { Loader2 } from "lucide-react";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  source: string;
  region: string;
  regionName: string;
  country: string;
  countryName: string;
  guid: string;
}

type NewsByRegion = Record<string, NewsItem[]>;

interface PackageWithPlatform extends Package {
  platform: {
    id: number;
    name: string;
    slug: string;
    isActive: boolean;
  };
}

const Home = () => {
  const { data: packages, isLoading } = useQuery<PackageWithPlatform[]>({
    queryKey: ["/api/packages"],
    queryFn: async () => {
      const res = await fetch("/api/packages");
      if (!res.ok) throw new Error("Failed to fetch packages");
      return res.json();
    }
  });

  const { data: newsByRegion } = useQuery<NewsByRegion>({
    queryKey: ["/api/news/latest"],
  });

  const platforms = ["spotify", "youtube", "tiktok"];
  const regions = newsByRegion ? Object.keys(newsByRegion) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Hero />

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Reklam Paketleri</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Her platform için özel hazırlanmış, ihtiyaçlarınıza uygun reklam paketlerimizle
            müziğinizi doğru kitleye ulaştırın.
          </p>

          <Tabs defaultValue="spotify" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-12">
              {platforms.map((platform) => (
                <TabsTrigger key={platform} value={platform} className="capitalize">
                  {platform === "tiktok" ? "TikTok" : platform}
                </TabsTrigger>
              ))}
            </TabsList>

            {platforms.map((platform) => (
              <TabsContent key={platform} value={platform}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {packages
                    ?.filter((pkg) => pkg.platform?.slug?.toLowerCase() === platform)
                    .map((pkg) => (
                      <PackageCard key={pkg.id} pkg={pkg} />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Müzik Dünyasından Haberler</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Müzik endüstrisindeki son gelişmeleri ve trendleri takip edin.
          </p>

          {regions.length > 0 && (
            <Tabs defaultValue={regions.find(r => r === 'Turkey') || regions[0]}>
              <TabsList className="flex justify-center mb-8">
                {regions.map(region => (
                  <TabsTrigger key={region} value={region}>
                    {newsByRegion[region][0].regionName}
                  </TabsTrigger>
                ))}
              </TabsList>

              {regions.map(region => (
                <TabsContent key={region} value={region}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {newsByRegion[region].map((item) => (
                      <NewsCard key={item.guid} {...item} />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
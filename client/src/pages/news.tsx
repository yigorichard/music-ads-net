import NewsCard from "@/components/news/news-card";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const News = () => {
  const { data: newsByRegion } = useQuery<NewsByRegion>({
    queryKey: ["/api/news/latest"],
  });

  const regions = newsByRegion ? Object.keys(newsByRegion) : [];
  const defaultRegion = regions.find(r => r === 'Turkey') || regions[0];

  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-4">Müzik Endüstrisi Haberleri</h1>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Dünya çapında müzik endüstrisindeki son gelişmeleri takip edin.
        </p>

        {regions.length > 0 && (
          <Tabs defaultValue={defaultRegion} className="w-full">
            <TabsList className="grid w-full grid-cols-5 max-w-4xl mx-auto mb-12">
              {regions.map(region => (
                <TabsTrigger key={region} value={region}>
                  {newsByRegion[region][0].regionName}
                </TabsTrigger>
              ))}
            </TabsList>

            {regions.map(region => (
              <TabsContent key={region} value={region}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {newsByRegion[region].map((item) => (
                    <NewsCard key={item.guid} {...item} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default News;
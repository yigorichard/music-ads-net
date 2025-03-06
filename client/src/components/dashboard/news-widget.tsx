import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "wouter";
import { ExternalLink, Newspaper } from "lucide-react";
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

const NewsWidget = () => {
  const [, setLocation] = useLocation();
  const { data: newsByRegion } = useQuery<NewsByRegion>({
    queryKey: ["/api/news/latest"],
  });

  const regions = newsByRegion ? Object.keys(newsByRegion) : [];
  const defaultRegion = regions.find(r => r === 'Turkey') || regions[0];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          Trending Music News
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-xs"
          onClick={() => setLocation("/news")}
        >
          View All
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        {regions.length > 0 && (
          <Tabs defaultValue={defaultRegion}>
            <TabsList className="w-full mb-4">
              {regions.map(region => (
                <TabsTrigger 
                  key={region} 
                  value={region}
                  className="flex-1"
                >
                  {newsByRegion[region][0].regionName}
                </TabsTrigger>
              ))}
            </TabsList>
            {regions.map(region => (
              <TabsContent key={region} value={region}>
                <ScrollArea className="h-[280px] pr-4">
                  <div className="space-y-4">
                    {newsByRegion[region].map((item) => (
                      <div
                        key={item.guid}
                        className="cursor-pointer group"
                        onClick={() => window.open(item.link, '_blank', 'noopener,noreferrer')}
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-md bg-gray-100 p-2 mt-1">
                            <Newspaper className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium leading-tight group-hover:text-primary transition-colors line-clamp-2">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {item.source}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                {new Date(item.pubDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsWidget;
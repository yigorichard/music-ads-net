import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useParams } from "wouter";

interface NewsDetail {
  title: string;
  content: string;
  source: string;
  pubDate: string;
  guid: string;
  region: string;
  regionName: string;
}

export default function NewsDetail() {
  const { id } = useParams();

  const { data: news, isLoading } = useQuery<NewsDetail>({
    queryKey: ["/api/news/latest"],
    select: (data) => {
      const allNews = Object.values(data).flat();
      return allNews.find(item => item.guid === decodeURIComponent(id as string));
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Haber bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{news.title}</CardTitle>
          <div className="text-sm text-gray-500">
            {new Date(news.pubDate).toLocaleDateString()} • {news.source} • {news.regionName}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: news.content }} />
        </CardContent>
      </Card>
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

interface NewsCardProps {
  title: string;
  content: string;
  pubDate: string;
  source: string;
  guid: string;
}

const NewsCard = ({ title, content, pubDate, source, guid }: NewsCardProps) => {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setLocation(`/news/${encodeURIComponent(guid)}`);
  };

  return (
    <Card 
      className="hover:border-primary transition-colors cursor-pointer" 
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-lg font-bold line-clamp-2">{title}</CardTitle>
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {new Date(pubDate).toLocaleDateString()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="text-gray-600 line-clamp-3 mb-4"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <div className="text-sm text-gray-500">Source: {source}</div>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
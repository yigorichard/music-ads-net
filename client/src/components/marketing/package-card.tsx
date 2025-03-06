import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package } from "@db/schema";
import { SiSpotify, SiYoutube, SiTiktok } from "react-icons/si";
import { Check } from "lucide-react";
import { useLocation } from "wouter";

interface PackageCardProps {
  pkg: Package & { 
    platform: { 
      id: number; 
      name: string; 
      slug: string; 
      isActive: boolean 
    } 
  };
}

const platformIcons = {
  spotify: <SiSpotify className="w-5 h-5 text-[#1DB954]" />,
  youtube: <SiYoutube className="w-5 h-5 text-[#FF0000]" />,
  tiktok: <SiTiktok className="w-5 h-5" />
};

const platformClasses = {
  spotify: "border-[#1DB954] hover:border-[#1DB954]/80",
  youtube: "border-[#FF0000] hover:border-[#FF0000]/80",
  tiktok: "border-gray-900 hover:border-gray-900/80"
};

const billingPeriodText = {
  monthly: "/ay",
  yearly: "/yıl",
  "one-time": " tek seferlik"
};

const PackageCard = ({ pkg }: PackageCardProps) => {
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    setLocation(`/create-promotion/${pkg.platform.slug}/${pkg.id}`);
  };

  const platformSlug = pkg.platform.slug.toLowerCase();

  return (
    <Card className={`border-2 ${platformClasses[platformSlug as keyof typeof platformClasses]}`}>
      <CardHeader>
        <div className="flex items-center gap-2 mb-4">
          {platformIcons[platformSlug as keyof typeof platformIcons]}
          <span className="text-sm font-medium uppercase">{pkg.platform.name}</span>
        </div>
        <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-6">
          ${pkg.price}
          <span className="text-sm font-normal text-gray-600">
            {billingPeriodText[pkg.billingPeriod as keyof typeof billingPeriodText] || "/ay"}
          </span>
        </div>
        <ul className="space-y-3">
          {pkg.features?.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 shrink-0" />
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleGetStarted}>
          {pkg.billingPeriod === "one-time" ? "Hemen Başla" : "Paketi Seç"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PackageCard;
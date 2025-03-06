import PackageCard from "@/components/marketing/package-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Package } from "@db/schema";
import { Loader2 } from "lucide-react";

interface PackageWithPlatform extends Package {
  platform: {
    id: number;
    name: string;
    slug: string;
    isActive: boolean;
  };
}

const Packages = () => {
  const { data: packages, isLoading } = useQuery<PackageWithPlatform[]>({
    queryKey: ["/api/packages"],
    queryFn: async () => {
      const res = await fetch("/api/packages");
      if (!res.ok) throw new Error("Failed to fetch packages");
      return res.json();
    }
  });

  const platforms = ["spotify", "youtube", "tiktok"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!packages) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">No packages available</p>
      </div>
    );
  }

  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-4">Advertising Packages</h1>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Choose the perfect promotion package for your music across major platforms.
        </p>

        <Tabs defaultValue="spotify" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-12">
            {platforms.map((platform) => (
              <TabsTrigger key={platform} value={platform} className="capitalize">
                {platform}
              </TabsTrigger>
            ))}
          </TabsList>

          {platforms.map((platform) => (
            <TabsContent key={platform} value={platform}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {packages
                  .filter((pkg) => pkg.platform?.slug?.toLowerCase() === platform)
                  .map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Packages;
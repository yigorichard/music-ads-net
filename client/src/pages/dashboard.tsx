import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "wouter";
import { ArrowUpRight, Music, Package, Users, Wallet } from "lucide-react";
import { BalanceHistory } from "@/components/BalanceHistory";
import NewsWidget from "@/components/dashboard/news-widget";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    onError: () => setLocation("/auth/login"),
  });

  const { data: promotions } = useQuery({
    queryKey: ["/api/promotions/user"],
  });

  const totalViews = promotions?.reduce((acc: number, promo: any) => acc + (promo.views || 0), 0) || 0;

  const stats = [
    {
      title: "Bakiye",
      value: `$${user?.balance || 0}`,
      icon: Wallet,
    },
    {
      title: "Aktif Promosyonlar",
      value: promotions?.filter((p: any) => p.status === "active").length || 0,
      icon: Package,
    },
    {
      title: "Toplam İzlenme",
      value: totalViews,
      icon: Users,
    },
    {
      title: "Müzik Sayısı",
      value: promotions?.length || 0,
      icon: Music,
    },
  ];

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Merhaba, {user?.name}</h1>
          <p className="text-gray-600 mt-2">Müzik promosyonlarınızı buradan yönetebilirsiniz.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Son Promosyonlar</CardTitle>
                <CardDescription>
                  En son eklenen promosyonlarınız
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {promotions?.map((promo: any) => (
                      <Card key={promo.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium">{promo.package.name}</div>
                              <div className="text-sm text-gray-600">
                                {new Date(promo.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-sm">
                              {promo.status === "pending" && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                  İnceleniyor
                                </span>
                              )}
                              {promo.status === "active" && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                  Aktif
                                </span>
                              )}
                              {promo.status === "completed" && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  Tamamlandı
                                </span>
                              )}
                              {promo.status === "rejected" && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                  Reddedildi
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {promo.contentUrl}
                          </div>
                          <div className="text-sm text-gray-600 mt-2">
                            {promo.views || 0} görüntülenme
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <div className="mt-8">
              <BalanceHistory />
            </div>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Hızlı İşlemler</CardTitle>
                <CardDescription>
                  Sık kullanılan işlemlere hızlıca erişin
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => setLocation("/packages")}
                >
                  Yeni Promosyon Başlat
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => setLocation("/dashboard/balance")}
                >
                  Bakiye Yükle
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => setLocation("/news")}
                >
                  Müzik Haberleri
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <NewsWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
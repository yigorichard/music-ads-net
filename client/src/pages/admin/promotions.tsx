import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Loader2 } from "lucide-react";

interface Package {
  id: number;
  name: string;
  platform: string;
  price: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Promotion {
  id: number;
  status: 'pending' | 'active' | 'rejected';
  contentUrl: string;
  createdAt: string;
  package: Package;
  user: User;
}

export default function AdminPromotions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: promotions, isLoading } = useQuery<Promotion[]>({
    queryKey: ["/api/admin/promotions"],
    queryFn: async () => {
      const res = await fetch("/api/admin/promotions");
      if (!res.ok) throw new Error("Failed to fetch promotions");
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update promotion");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/promotions"] });
      toast({
        title: "Promosyon güncellendi",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Promosyon Yönetimi</h1>

      <Card>
        <CardHeader>
          <CardTitle>Bekleyen Promosyonlar</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {promotions?.map((promo) => (
                <Card key={promo.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-medium">{promo.package.name}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(promo.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          promo.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          promo.status === 'active' ? 'bg-green-100 text-green-800' :
                          promo.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {promo.status === 'pending' ? 'İnceleniyor' :
                           promo.status === 'active' ? 'Aktif' :
                           promo.status === 'rejected' ? 'Reddedildi' :
                           'Tamamlandı'}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Kullanıcı: {promo.user.name}</p>
                      <p>İçerik: {promo.contentUrl}</p>
                    </div>
                    {promo.status === 'pending' && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => updateMutation.mutate({ id: promo.id, status: "active" })}
                          disabled={updateMutation.isPending}
                        >
                          <Check className="w-4 h-4 mr-2" /> Onayla
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateMutation.mutate({ id: promo.id, status: "rejected" })}
                          disabled={updateMutation.isPending}
                        >
                          <X className="w-4 h-4 mr-2" /> Reddet
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
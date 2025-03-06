import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wallet } from "lucide-react";

const balanceOptions = [
  { amount: 50, description: "Starter Pack - Temel promosyonlar için" },
  { amount: 100, description: "Growth Pack - Orta düzey promosyonlar için" },
  { amount: 200, description: "Pro Pack - Profesyonel promosyonlar için" },
  { amount: 500, description: "Enterprise Pack - Büyük ölçekli promosyonlar için" },
];

export default function Balance() {
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const handleAddBalance = async (amount: number) => {
    toast({
      title: "Ödeme sayfasına yönlendiriliyorsunuz",
      description: "Lütfen bekleyin...",
    });

    // TODO: Implement payment gateway integration
    // For now, just show a message
    setTimeout(() => {
      toast({
        title: "Ödeme sistemi yakında aktif olacak",
        description: "Şu anda test aşamasındayız.",
      });
    }, 2000);
  };

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Wallet className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Bakiye Yükle</h1>
            <p className="text-gray-600">Mevcut bakiye: ${user?.balance || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {balanceOptions.map((option) => (
            <Card key={option.amount}>
              <CardHeader>
                <CardTitle>${option.amount}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => handleAddBalance(option.amount)}
                >
                  Bakiye Yükle
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Bakiye Geçmişi</CardTitle>
            <CardDescription>
              Son bakiye yükleme işlemleriniz
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-center py-8">
              Henüz bakiye yükleme işlemi yapılmamış
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

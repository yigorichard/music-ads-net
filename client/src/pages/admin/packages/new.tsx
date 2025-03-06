import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Platform {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
}

export default function NewPackage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    platformId: "",
    price: 0,
    features: [],
    tier: "basic"
  });

  const { data: platforms } = useQuery<Platform[]>({
    queryKey: ["/api/admin/platforms"],
    queryFn: async () => {
      const res = await fetch("/api/admin/platforms", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch platforms");
      return res.json();
    },
  });

  const createPackageMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create package");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Paket başarıyla oluşturuldu",
      });
      setLocation("/admin/packages");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPackageMutation.mutate(formData);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Yeni Paket Oluştur</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paket Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label>Platform</label>
              <Select
                value={formData.platformId}
                onValueChange={(value) =>
                  setFormData({ ...formData, platformId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Platform seçin" />
                </SelectTrigger>
                <SelectContent>
                  {platforms?.map((platform) => (
                    <SelectItem 
                      key={platform.id} 
                      value={String(platform.id)}
                    >
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label>Paket Adı</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label>Fiyat</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseInt(e.target.value) })
                }
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={createPackageMutation.isPending}
            >
              {createPackageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Oluştur
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Edit2, Trash2, Plus, Loader2, X } from "lucide-react";
import { useState } from "react";
import { Package } from "@db/schema";

interface Platform {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
}

interface PackageWithPlatform extends Package {
  platform: Platform;
  billingPeriod?: 'monthly' | 'yearly' | 'one-time';
}

interface UpdatePackageData {
  name: string;
  platformId: number;
  price: number;
  features: string[];
  tier: string;
  billingPeriod: 'monthly' | 'yearly' | 'one-time';
}

export default function AdminPackages() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [editingPackage, setEditingPackage] = useState<PackageWithPlatform | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newFeature, setNewFeature] = useState("");

  const { data: packages, isLoading } = useQuery<PackageWithPlatform[]>({
    queryKey: ["/api/admin/packages"],
    queryFn: async () => {
      const res = await fetch("/api/admin/packages", {
        credentials: 'include'
      });
      if (!res.ok) throw new Error("Failed to fetch packages");
      return res.json();
    },
  });

  const { data: platforms } = useQuery<Platform[]>({
    queryKey: ["/api/admin/platforms"],
    queryFn: async () => {
      const res = await fetch("/api/admin/platforms", {
        credentials: 'include'
      });
      if (!res.ok) throw new Error("Failed to fetch platforms");
      return res.json();
    },
  });

  const updatePackageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdatePackageData }) => {
      const res = await fetch(`/api/admin/packages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update package");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Paket güncellendi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/packages"] });
      setEditingPackage(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/packages/${id}`, {
        method: "DELETE",
        credentials: 'include'
      });
      if (!res.ok) throw new Error("Failed to delete package");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Paket silindi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/packages"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    },
  });

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    if (!editingPackage) return;

    setEditingPackage({
      ...editingPackage,
      features: [...(editingPackage.features || []), newFeature.trim()]
    });
    setNewFeature("");
  };

  const handleRemoveFeature = (index: number) => {
    if (!editingPackage) return;
    const newFeatures = [...(editingPackage.features || [])];
    newFeatures.splice(index, 1);
    setEditingPackage({
      ...editingPackage,
      features: newFeatures
    });
  };

  const handleUpdatePackage = (pkg: PackageWithPlatform) => {
    if (!pkg.platform?.id) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Lütfen bir platform seçin"
      });
      return;
    }

    updatePackageMutation.mutate({
      id: pkg.id,
      data: {
        name: pkg.name,
        platformId: pkg.platform.id,
        price: pkg.price,
        features: pkg.features || [],
        tier: pkg.tier || 'basic',
        billingPeriod: pkg.billingPeriod || 'monthly'
      }
    });
  };

  const filteredPackages = packages?.filter(pkg =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.platform?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Paket Yönetimi</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Paket ara..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setLocation("/admin/packages/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Paket
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Paketler</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paket Adı</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Fiyat</TableHead>
                <TableHead>Dönem</TableHead>
                <TableHead>Özellikler</TableHead>
                <TableHead className="w-[100px]">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPackages?.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell>
                    <div className="font-medium">{pkg.name}</div>
                  </TableCell>
                  <TableCell>{pkg.platform?.name || 'No Platform'}</TableCell>
                  <TableCell>${pkg.price}</TableCell>
                  <TableCell>{pkg.billingPeriod || 'monthly'}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate">
                      {pkg.features?.join(", ")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingPackage(pkg)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Paket Düzenle</DialogTitle>
                          </DialogHeader>
                          {editingPackage && (
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <label>Platform</label>
                                <Select
                                  value={String(editingPackage.platform?.id || '')}
                                  onValueChange={(value) => setEditingPackage({
                                    ...editingPackage,
                                    platform: platforms?.find(p => p.id === parseInt(value)) || editingPackage.platform
                                  })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Platform seçin" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {platforms?.map(platform => (
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
                                  value={editingPackage.name}
                                  onChange={(e) => setEditingPackage({
                                    ...editingPackage,
                                    name: e.target.value
                                  })}
                                />
                              </div>
                              <div className="space-y-2">
                                <label>Fiyat</label>
                                <Input
                                  type="number"
                                  value={editingPackage.price}
                                  onChange={(e) => setEditingPackage({
                                    ...editingPackage,
                                    price: parseFloat(e.target.value)
                                  })}
                                />
                              </div>
                              <div className="space-y-2">
                                <label>Fatura Dönemi</label>
                                <Select
                                  value={editingPackage.billingPeriod || 'monthly'}
                                  onValueChange={(value) => setEditingPackage({
                                    ...editingPackage,
                                    billingPeriod: value as 'monthly' | 'yearly' | 'one-time'
                                  })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="monthly">Aylık</SelectItem>
                                    <SelectItem value="yearly">Yıllık</SelectItem>
                                    <SelectItem value="one-time">Tek Seferlik</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <label>Özellikler</label>
                                <div className="flex gap-2 mb-2">
                                  <Input
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    placeholder="Yeni özellik ekle..."
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddFeature();
                                      }
                                    }}
                                  />
                                  <Button onClick={handleAddFeature}>
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  {editingPackage.features?.map((feature, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                      <span>{feature}</span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveFeature(index)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <Button
                                className="w-full"
                                onClick={() => handleUpdatePackage(editingPackage)}
                                disabled={updatePackageMutation.isPending}
                              >
                                {updatePackageMutation.isPending && (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                )}
                                Güncelle
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Bu paketi silmek istediğinizden emin misiniz?')) {
                            deletePackageMutation.mutate(pkg.id);
                          }
                        }}
                        disabled={deletePackageMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
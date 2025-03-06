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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Edit2, Trash2, Plus, Loader2 } from "lucide-react";
import { useState } from "react";

interface Platform {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

interface EditPlatformForm {
  name: string;
  slug: string;
  isActive: boolean;
}

export default function AdminPlatforms() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [editForm, setEditForm] = useState<EditPlatformForm>({
    name: "",
    slug: "",
    isActive: true
  });

  const { data: platforms, isLoading } = useQuery<Platform[]>({
    queryKey: ["/api/admin/platforms"],
    queryFn: async () => {
      const res = await fetch("/api/admin/platforms", {
        credentials: 'include'
      });
      if (!res.ok) throw new Error("Failed to fetch platforms");
      return res.json();
    },
  });

  const updatePlatformMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Platform> }) => {
      const res = await fetch(`/api/admin/platforms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update platform");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Platform güncellendi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/platforms"] });
      setEditingPlatform(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    },
  });

  const createPlatformMutation = useMutation({
    mutationFn: async (data: Omit<Platform, 'id' | 'createdAt'>) => {
      const res = await fetch("/api/admin/platforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create platform");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Platform oluşturuldu",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/platforms"] });
      setEditForm({ name: "", slug: "", isActive: true });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    },
  });

  const deletePlatformMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/platforms/${id}`, {
        method: "DELETE",
        credentials: 'include'
      });
      if (!res.ok) throw new Error("Failed to delete platform");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Platform silindi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/platforms"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    },
  });

  const handleUpdatePlatform = (platform: Platform) => {
    updatePlatformMutation.mutate({
      id: platform.id,
      data: {
        name: platform.name,
        slug: platform.slug,
        isActive: platform.isActive
      }
    });
  };

  const handleCreatePlatform = () => {
    if (!editForm.name || !editForm.slug) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Tüm alanları doldurun",
      });
      return;
    }

    createPlatformMutation.mutate(editForm);
  };

  const filteredPlatforms = platforms?.filter(platform => 
    platform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    platform.slug.toLowerCase().includes(searchQuery.toLowerCase())
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
        <h1 className="text-3xl font-bold">Platform Yönetimi</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Platform ara..." 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Platform
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Platform Ekle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label>Platform Adı</label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label>Slug</label>
                  <Input
                    value={editForm.slug}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      slug: e.target.value
                    })}
                  />
                </div>
                <Button 
                  className="w-full"
                  onClick={handleCreatePlatform}
                  disabled={createPlatformMutation.isPending}
                >
                  {createPlatformMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Oluştur
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Platformlar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform Adı</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Oluşturma Tarihi</TableHead>
                <TableHead className="w-[100px]">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlatforms?.map((platform) => (
                <TableRow key={platform.id}>
                  <TableCell>
                    <div className="font-medium">{platform.name}</div>
                  </TableCell>
                  <TableCell>{platform.slug}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      platform.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {platform.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(platform.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setEditingPlatform(platform);
                              setEditForm({
                                name: platform.name,
                                slug: platform.slug,
                                isActive: platform.isActive
                              });
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Platform Düzenle</DialogTitle>
                          </DialogHeader>
                          {editingPlatform && (
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <label>Platform Adı</label>
                                <Input
                                  value={editForm.name}
                                  onChange={(e) => setEditForm({
                                    ...editForm,
                                    name: e.target.value,
                                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
                                  })}
                                />
                              </div>
                              <div className="space-y-2">
                                <label>Slug</label>
                                <Input
                                  value={editForm.slug}
                                  onChange={(e) => setEditForm({
                                    ...editForm,
                                    slug: e.target.value
                                  })}
                                />
                              </div>
                              <Button 
                                className="w-full"
                                onClick={() => {
                                  if (editingPlatform) {
                                    handleUpdatePlatform({
                                      ...editingPlatform,
                                      ...editForm
                                    });
                                  }
                                }}
                                disabled={updatePlatformMutation.isPending}
                              >
                                {updatePlatformMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
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
                          if (confirm('Bu platformu silmek istediğinizden emin misiniz?')) {
                            deletePlatformMutation.mutate(platform.id);
                          }
                        }}
                        disabled={deletePlatformMutation.isPending}
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
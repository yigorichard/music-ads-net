import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Search, Edit2, Trash2, Plus } from "lucide-react";

interface BlogTag {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
}

export default function AdminBlogTags() {
  const { toast } = useToast();
  const { data: tags } = useQuery<BlogTag[]>({
    queryKey: ["/api/admin/blog/tags"],
  });

  const updateTagMutation = useMutation({
    mutationFn: async ({ id, data }: any) => {
      const res = await fetch(`/api/admin/blog/tags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update tag");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Etiket güncellendi",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message,
      });
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Blog Etiketleri</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input placeholder="Etiket ara..." className="pl-8" />
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Etiket
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Etiketler</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Etiket Adı</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Oluşturma Tarihi</TableHead>
                <TableHead className="w-[100px]">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags?.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <div className="font-medium">{tag.name}</div>
                  </TableCell>
                  <TableCell>{tag.slug}</TableCell>
                  <TableCell>
                    {new Date(tag.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
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

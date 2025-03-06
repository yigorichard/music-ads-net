import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  status: 'new' | 'read';
}

export default function AdminContact() {
  const { toast } = useToast();
  const { data: submissions, refetch } = useQuery<ContactSubmission[]>({
    queryKey: ["/api/admin/contact"],
    queryFn: async () => {
      const res = await fetch("/api/admin/contact");
      if (!res.ok) throw new Error("Failed to fetch contact submissions");
      return res.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'new' | 'read' }) => {
      const res = await fetch(`/api/admin/contact/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Durum güncellendi",
      });
      refetch();
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
        <h1 className="text-3xl font-bold">İletişim Formları</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input placeholder="Mesaj ara..." className="pl-8" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gelen Mesajlar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>İsim</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mesaj</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="w-[100px]">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions?.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>{submission.name}</TableCell>
                  <TableCell>{submission.email}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {submission.message}
                  </TableCell>
                  <TableCell>
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        submission.status === 'new'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {submission.status === 'new' ? 'Yeni' : 'Okundu'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: submission.id,
                          status: submission.status === 'new' ? 'read' : 'new',
                        })
                      }
                    >
                      {submission.status === 'new' ? 'Okundu Yap' : 'Yeni Yap'}
                    </Button>
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
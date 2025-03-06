import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Users, Package, Bell, MessageSquare, BarChart2, BookOpen, Hash, FolderTree, LogOut, Loader2 } from "lucide-react";
import type { User } from "@db/schema";

const adminNavItems = [
  {
    title: "Dashboard",
    icon: BarChart2,
    href: "/admin",
  },
  {
    title: "Kullanıcılar",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "Paketler",
    icon: Package,
    href: "/admin/packages",
  },
  {
    title: "Promosyonlar",
    icon: Bell,
    href: "/admin/promotions",
  },
  {
    title: "Blog Yazıları",
    icon: BookOpen,
    href: "/admin/blog/posts",
  },
  {
    title: "Blog Kategorileri",
    icon: FolderTree,
    href: "/admin/blog/categories",
  },
  {
    title: "Blog Etiketleri",
    icon: Hash,
    href: "/admin/blog/tags",
  },
  {
    title: "İletişim Formları",
    icon: MessageSquare,
    href: "/admin/contact",
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Çıkış yapılamadı');
      return res.json();
    },
    onSuccess: () => {
      setLocation('/');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Yetkisiz Erişim</h1>
          <p className="text-gray-600 mb-4">Bu sayfaya erişim yetkiniz yok.</p>
          <Link href="/">
            <Button>Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="flex h-16 items-center px-4 justify-between">
          <Link href="/admin">
            <span className="text-xl font-bold">Admin Panel</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.name}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        <aside className="w-64 border-r bg-white min-h-[calc(100vh-4rem)]">
          <nav className="space-y-1 p-4">
            {adminNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
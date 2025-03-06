import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";

const Navigation = () => {
  const isMobile = useIsMobile();
  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const NavItems = () => (
    <>
      <Link href="/">
        <Button variant="ghost">Ana Sayfa</Button>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">Promosyonlar</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <Link href="/platforms/spotify">
            <DropdownMenuItem className="cursor-pointer">
              Spotify Promosyon
            </DropdownMenuItem>
          </Link>
          <Link href="/platforms/youtube">
            <DropdownMenuItem className="cursor-pointer">
              YouTube Promosyon
            </DropdownMenuItem>
          </Link>
          <Link href="/platforms/tiktok">
            <DropdownMenuItem className="cursor-pointer">
              TikTok Promosyon
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
      <Link href="/packages">
        <Button variant="ghost">Paketler</Button>
      </Link>
      <Link href="/news">
        <Button variant="ghost">Haberler</Button>
      </Link>
      <Link href="/contact">
        <Button variant="ghost">İletişim</Button>
      </Link>
      {user ? (
        <>
          {user.isAdmin && (
            <Link href="/admin">
              <Button variant="ghost">Admin Panel</Button>
            </Link>
          )}
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
        </>
      ) : (
        <Link href="/auth/login">
          <Button>Giriş Yap</Button>
        </Link>
      )}
    </>
  );

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/">
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              MusicADS.net
            </span>
          </Link>

          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-4">
                  <NavItems />
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex gap-2">
              <NavItems />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
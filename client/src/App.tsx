import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AdminRoute } from "@/components/routes/AdminRoute";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";
import Home from "@/pages/home";
import Packages from "@/pages/packages";
import News from "@/pages/news";
import Contact from "@/pages/contact";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import Dashboard from "@/pages/dashboard";
import CreatePromotion from "@/pages/create-promotion";
import SpotifyPromotion from "@/pages/platforms/spotify";
import YouTubePromotion from "@/pages/platforms/youtube";
import TikTokPromotion from "@/pages/platforms/tiktok";
import NotFound from "@/pages/not-found";
import Balance from "@/pages/dashboard/balance";
import Profile from "@/pages/dashboard/profile";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminPromotions from "@/pages/admin/promotions";
import AdminPackages from "@/pages/admin/packages";
import NewPackage from "@/pages/admin/packages/new";
import AdminPlatforms from "@/pages/admin/platforms";
import NewPlatform from "@/pages/admin/platforms/new";
import AdminContact from "@/pages/admin/contact";
import AdminBlogPosts from "@/pages/admin/blog/posts";
import AdminBlogCategories from "@/pages/admin/blog/categories";
import AdminBlogTags from "@/pages/admin/blog/tags";
import NewsDetail from "@/pages/news/[id]";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">
          <Switch>
            {/* Public Routes */}
            <Route path="/" component={Home} />
            <Route path="/packages" component={Packages} />
            <Route path="/news" component={News} />
            <Route path="/news/:id" component={NewsDetail} />
            <Route path="/contact" component={Contact} />
            <Route path="/auth/login" component={Login} />
            <Route path="/auth/register" component={Register} />

            {/* Dashboard Routes */}
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/dashboard/balance" component={Balance} />
            <Route path="/dashboard/profile" component={Profile} />
            <Route path="/create-promotion/:platform/:packageId" component={CreatePromotion} />
            <Route path="/platforms/spotify" component={SpotifyPromotion} />
            <Route path="/platforms/youtube" component={YouTubePromotion} />
            <Route path="/platforms/tiktok" component={TikTokPromotion} />

            {/* Admin Routes */}
            <AdminRoute path="/admin" component={AdminDashboard} />
            <AdminRoute path="/admin/users" component={AdminUsers} />
            <AdminRoute path="/admin/promotions" component={AdminPromotions} />
            <AdminRoute path="/admin/packages" component={AdminPackages} />
            <AdminRoute path="/admin/packages/new" component={NewPackage} />
            <AdminRoute path="/admin/platforms" component={AdminPlatforms} />
            <AdminRoute path="/admin/platforms/new" component={NewPlatform} />
            <AdminRoute path="/admin/contact" component={AdminContact} />
            <AdminRoute path="/admin/blog/posts" component={AdminBlogPosts} />
            <AdminRoute path="/admin/blog/categories" component={AdminBlogCategories} />
            <AdminRoute path="/admin/blog/tags" component={AdminBlogTags} />

            {/* 404 Route */}
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
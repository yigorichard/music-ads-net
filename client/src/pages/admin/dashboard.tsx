import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, Package, Bell, MessageSquare, 
  TrendingUp, DollarSign, Music2, Loader2
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PLATFORM_COLORS = {
  spotify: "#1DB954",
  youtube: "#FF0000",
  tiktok: "#000000",
};

interface Stats {
  totalUsers: number;
  activePromotions: number;
  totalRevenue: number;
  totalContent: number;
  platformStats: Array<{
    platform: string;
    count: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
}

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Veri yüklenirken bir hata oluştu.</p>
      </div>
    );
  }

  const overviewCards = [
    {
      title: "Toplam Kullanıcı",
      icon: Users,
      value: stats?.totalUsers || 0,
      change: "+20%",
      trend: "up",
    },
    {
      title: "Aktif Promosyonlar",
      icon: Bell,
      value: stats?.activePromotions || 0,
      change: "+12%",
      trend: "up",
    },
    {
      title: "Toplam Gelir",
      icon: DollarSign,
      value: `$${stats?.totalRevenue || 0}`,
      change: "+8%",
      trend: "up",
    },
    {
      title: "Toplam İçerik",
      icon: Music2,
      value: stats?.totalContent || 0,
      change: "+15%",
      trend: "up",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-xs text-gray-500">
                <span className={card.trend === "up" ? "text-green-600" : "text-red-600"}>
                  {card.change}
                </span>{" "}
                son 30 gün
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Platform Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.platformStats}
                    dataKey="count"
                    nameKey="platform"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ platform }) => platform}
                  >
                    {stats?.platformStats?.map((entry) => (
                      <Cell 
                        key={entry.platform} 
                        fill={PLATFORM_COLORS[entry.platform as keyof typeof PLATFORM_COLORS]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gelir Analizi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
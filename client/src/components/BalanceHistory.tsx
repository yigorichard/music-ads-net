import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface BalanceLog {
  id: number;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
  referenceId: number;
  referenceType: string;
}

export function BalanceHistory() {
  const { data: logs, isLoading } = useQuery<BalanceLog[]>({
    queryKey: ["/api/users/balance/history"],
    queryFn: async () => {
      const res = await fetch("/api/users/balance/history");
      if (!res.ok) throw new Error("Failed to fetch balance history");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bakiye Geçmişi</CardTitle>
        <CardDescription>Tüm bakiye hareketleriniz</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs?.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between border-b pb-2 last:border-0"
            >
              <div>
                <p className="font-medium">{log.description}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(log.createdAt), "dd.MM.yyyy HH:mm")}
                </p>
              </div>
              <span
                className={`text-lg font-semibold ${
                  log.amount >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {log.amount >= 0 ? "+" : ""}${log.amount}
              </span>
            </div>
          ))}
          {!logs?.length && (
            <p className="text-center text-gray-500">
              Henüz bakiye hareketi bulunmuyor.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

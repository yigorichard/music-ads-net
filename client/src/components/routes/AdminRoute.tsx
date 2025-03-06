import { Route } from "wouter";
import AdminLayout from "@/pages/admin/layout";

interface AdminRouteProps {
  path: string;
  component: React.ComponentType;
}

export function AdminRoute({ path, component: Component }: AdminRouteProps) {
  return (
    <Route path={path}>
      {() => (
        <AdminLayout>
          <Component />
        </AdminLayout>
      )}
    </Route>
  );
}

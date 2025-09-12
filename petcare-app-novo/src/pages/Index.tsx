// Conteúdo para: src/pages/Index.tsx
import Layout from "@/components/Layout";
import { DashboardStats } from "@/components/DashboardStats";
import { MeusPets } from "@/components/MeusPets";
import { RecentActivity } from "@/components/RecentActivity"; 
import { QuickActions } from "@/components/QuickActions";
import { UpcomingReminders } from "@/components/UpcomingReminders";

const Index = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard PetCare+</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe a saúde e bem-estar dos seus pets em um só lugar
          </p>
        </div>
        <DashboardStats />
        <MeusPets />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          <div className="space-y-6">
            <UpcomingReminders />
            <QuickActions />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
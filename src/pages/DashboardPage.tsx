export function DashboardPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Visão geral do seu CRM
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Total de Leads</h3>
            <p className="text-2xl font-bold text-card-foreground mt-2">1,234</p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Leads Qualificados</h3>
            <p className="text-2xl font-bold text-card-foreground mt-2">567</p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Propostas</h3>
            <p className="text-2xl font-bold text-card-foreground mt-2">89</p>
          </div>
          
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Fechamentos</h3>
            <p className="text-2xl font-bold text-card-foreground mt-2">34</p>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            Atividades Recentes
          </h2>
          <p className="text-muted-foreground">
            Em breve - funcionalidades do dashboard em desenvolvimento
          </p>
        </div>
      </div>
    </div>
  );
}

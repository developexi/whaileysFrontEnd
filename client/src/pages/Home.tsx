import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Activity, MessageSquare, Users, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: sessions, isLoading } = trpc.sessions.list.useQuery();
  const { data: healthCheck } = trpc.sessions.health.useQuery();

  const connectedSessions = sessions?.filter((s) => s.isConnected).length || 0;
  const totalSessions = sessions?.length || 0;

  const stats = [
    {
      title: "Total de Sessões",
      value: isLoading ? "..." : totalSessions,
      icon: MessageSquare,
      description: "Sessões WhatsApp cadastradas",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Sessões Conectadas",
      value: isLoading ? "..." : connectedSessions,
      icon: CheckCircle2,
      description: "Atualmente online",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Status da API",
      value: healthCheck?.healthy ? "Online" : "Offline",
      icon: Activity,
      description: "API Whaileys",
      color: healthCheck?.healthy ? "text-green-600" : "text-red-600",
      bgColor: healthCheck?.healthy ? "bg-green-50" : "bg-red-50",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema Whaileys
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Sessões WhatsApp
              </CardTitle>
              <CardDescription>
                Gerencie suas sessões WhatsApp conectadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Visualize, crie e delete sessões WhatsApp. Monitore o status de
                conexão em tempo real.
              </p>
              <Link href="/sessions">
                <Button className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Gerenciar Sessões
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários
              </CardTitle>
              <CardDescription>
                Controle de acesso ao sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Gerencie os usuários que têm acesso ao painel administrativo do
                Whaileys.
              </p>
              <Link href="/users">
                <Button variant="outline" className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Gerenciar Usuários
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo ao Whaileys Frontend</CardTitle>
            <CardDescription>
              Sistema de gerenciamento de sessões WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Recursos Principais:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>
                    Listagem completa de todas as sessões WhatsApp cadastradas
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>
                    Monitoramento de status em tempo real (conectado/desconectado)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>
                    Criação e exclusão de sessões de forma simples e segura
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>
                    Sistema de autenticação integrado com Manus OAuth
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>
                    Interface moderna e responsiva com Tailwind CSS
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

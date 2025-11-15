import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { Loader2, MessageSquare, Plus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Sessions() {
  const [newSessionId, setNewSessionId] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [qrCodeSessionId, setQrCodeSessionId] = useState<string | null>(null);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  
  const { data: sessions, isLoading, refetch } = trpc.sessions.list.useQuery();
  
  // WebSocket para atualizações em tempo real
  useWebSocket(() => {
    refetch();
  });
  const deleteMutation = trpc.sessions.delete.useMutation({
    onSuccess: () => {
      toast.success("Sessão deletada com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao deletar sessão: ${error.message}`);
    },
  });

  const createMutation = trpc.sessions.create.useMutation({
    onSuccess: (data) => {
      toast.success("Sessão criada com sucesso!");
      setIsCreateDialogOpen(false);
      setNewSessionId("");
      refetch();
      // Abrir modal de QR Code se houver
      if (data.qrCode) {
        setQrCodeSessionId(data.sessionId);
        setIsQrDialogOpen(true);
      }
    },
    onError: (error) => {
      toast.error(`Erro ao criar sessão: ${error.message}`);
    },
  });

  const { data: qrCode, refetch: refetchQr } = trpc.sessions.getQrCode.useQuery(
    { sessionId: qrCodeSessionId || "" },
    { enabled: !!qrCodeSessionId && isQrDialogOpen }
  );

  // Atualizar QR Code a cada 5 segundos
  useEffect(() => {
    if (isQrDialogOpen && qrCodeSessionId) {
      const interval = setInterval(() => {
        refetchQr();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isQrDialogOpen, qrCodeSessionId, refetchQr]);

  const handleDelete = async (sessionId: string) => {
    await deleteMutation.mutateAsync({ sessionId });
  };

  const handleCreate = async () => {
    if (!newSessionId.trim()) {
      toast.error("Digite um ID para a sessão");
      return;
    }
    await createMutation.mutateAsync({ sessionId: newSessionId.trim() });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-500">Conectado</Badge>;
      case "connecting":
        return <Badge className="bg-yellow-500">Conectando</Badge>;
      case "disconnected":
        return <Badge variant="destructive">Desconectado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sessões WhatsApp</h1>
            <p className="text-muted-foreground">
              Gerencie as sessões WhatsApp conectadas à API
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Sessão
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Sessão</DialogTitle>
                  <DialogDescription>
                    Digite um identificador único para a nova sessão WhatsApp
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionId">ID da Sessão</Label>
                    <Input
                      id="sessionId"
                      placeholder="ex: sessao-001"
                      value={newSessionId}
                      onChange={(e) => setNewSessionId(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCreate();
                        }
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Criar Sessão
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Lista de Sessões
            </CardTitle>
            <CardDescription>
              {sessions?.length || 0} sessão(ões) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : sessions && sessions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID da Sessão</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Última Conexão</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        {session.sessionId}
                      </TableCell>
                      <TableCell>{session.name || "-"}</TableCell>
                      <TableCell>{session.number || "-"}</TableCell>
                      <TableCell>{getStatusBadge(session.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(session.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {session.lastConnected
                          ? formatDate(session.lastConnected)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Confirmar exclusão
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja deletar a sessão{" "}
                                <strong>{session.sessionId}</strong>? Esta ação
                                não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(session.sessionId)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                {deleteMutation.isPending && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhuma sessão encontrada
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Crie uma nova sessão para começar
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Sessão
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de QR Code */}
        <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Conectar WhatsApp</DialogTitle>
              <DialogDescription>
                Escaneie o QR Code abaixo com o WhatsApp para conectar a sessão{" "}
                <strong>{qrCodeSessionId}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-6">
              {qrCode ? (
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <img
                    src={qrCode}
                    alt="QR Code WhatsApp"
                    className="w-64 h-64"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Aguardando QR Code...
                  </p>
                </div>
              )}
            </div>
            <DialogFooter className="sm:justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsQrDialogOpen(false);
                  setQrCodeSessionId(null);
                }}
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

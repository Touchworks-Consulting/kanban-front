import { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { LoadingSpinner } from '../LoadingSpinner';
import { AlertTriangle, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { userService } from '../../services';

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

export function ChangeRoleModal({
  isOpen,
  onClose,
  onSuccess,
  user
}: ChangeRoleModalProps) {
  const [newRole, setNewRole] = useState<'member' | 'admin' | 'owner'>(user.role as any || 'member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleLabels = {
    member: 'Membro',
    admin: 'Administrador',
    owner: 'Proprietário'
  };

  const roleDescriptions = {
    member: 'Acesso básico ao sistema',
    admin: 'Pode gerenciar usuários e configurações',
    owner: 'Controle total da conta'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newRole) {
      setError('Selecione um novo papel');
      return;
    }

    if (newRole === user.role) {
      setError('Selecione um papel diferente do atual');
      return;
    }

    setLoading(true);

    try {
      await userService.changeRole(user.id, newRole);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar papel do usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNewRole(user.role as any || 'member');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Papel do Usuário</DialogTitle>
          <DialogDescription>
            Alterar papel de <strong>{user.name}</strong> ({user.email})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Papel Atual: <strong>{roleLabels[user.role as keyof typeof roleLabels] || user.role}</strong></Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newRole">Novo Papel</Label>
            <Select
              value={newRole}
              onValueChange={(value) => setNewRole(value as 'member' | 'admin' | 'owner')}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o novo papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{roleLabels.member}</span>
                    <span className="text-xs text-muted-foreground">{roleDescriptions.member}</span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{roleLabels.admin}</span>
                    <span className="text-xs text-muted-foreground">{roleDescriptions.admin}</span>
                  </div>
                </SelectItem>
                <SelectItem value="owner">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{roleLabels.owner}</span>
                    <span className="text-xs text-muted-foreground">{roleDescriptions.owner}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-md p-3">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">Atenção:</p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li>Esta alteração afetará imediatamente as permissões do usuário</li>
                  <li>Owners têm controle total sobre a conta</li>
                  <li>Admins podem gerenciar usuários e configurações</li>
                  <li>Certifique-se de que esta mudança é apropriada</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !newRole || newRole === user.role}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Alterando...
                </>
              ) : (
                'Confirmar Alteração'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

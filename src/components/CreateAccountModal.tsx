import React, { useState } from 'react';
import { useAccountStore } from '../stores/useAccountStore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { LoadingSpinner } from './LoadingSpinner';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose
}) => {
  const { createAccount, loading } = useAccountStore();
  
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    plan: 'free' as 'free' | 'basic' | 'pro' | 'enterprise'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    try {
      await createAccount({
        name: formData.name.trim(),
        display_name: formData.display_name.trim() || formData.name.trim(),
        description: formData.description.trim() || undefined,
        plan: formData.plan
      });
      
      // Reset form
      setFormData({
        name: '',
        display_name: '',
        description: '',
        plan: 'free'
      });
      
      onClose();
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Conta</DialogTitle>
          <DialogDescription>
            Crie uma nova conta para organizar seus leads e projetos separadamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Conta *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Minha Empresa"
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Nome interno da conta (obrigatório)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">Nome de Exibição</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => handleChange('display_name', e.target.value)}
              placeholder="Ex: Minha Empresa Ltda"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Nome que será exibido na interface (opcional)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descreva o propósito desta conta..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan">Plano</Label>
            <Select 
              value={formData.plan} 
              onValueChange={(value: any) => handleChange('plan', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">
                  <div className="flex flex-col">
                    <span className="font-medium">Free</span>
                    <span className="text-xs text-muted-foreground">Funcionalidades básicas</span>
                  </div>
                </SelectItem>
                <SelectItem value="basic">
                  <div className="flex flex-col">
                    <span className="font-medium">Basic</span>
                    <span className="text-xs text-muted-foreground">Para pequenas equipes</span>
                  </div>
                </SelectItem>
                <SelectItem value="pro">
                  <div className="flex flex-col">
                    <span className="font-medium">Pro</span>
                    <span className="text-xs text-muted-foreground">Para empresas em crescimento</span>
                  </div>
                </SelectItem>
                <SelectItem value="enterprise">
                  <div className="flex flex-col">
                    <span className="font-medium">Enterprise</span>
                    <span className="text-xs text-muted-foreground">Para grandes organizações</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Criando...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import {
  Plus,
  Phone,
  Mail,
  MessageSquare,
  Edit,
  Trash2,
  Save,
  X,
  User,
  MapPin,
  Calendar,
  Star
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { LeadContact } from '../../../types/leadModal';
import { formatDate } from '../../../utils/helpers';

interface LeadContactsTabProps {
  leadId: string;
  initialContacts: LeadContact[];
}

export const LeadContactsTab: React.FC<LeadContactsTabProps> = ({
  leadId,
  initialContacts
}) => {
  const [contacts, setContacts] = useState<LeadContact[]>(initialContacts);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    notes: '',
    is_primary: false
  });

  const handleAddContact = async () => {
    if (!newContact.name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simular criação de contato
      const mockContact: LeadContact = {
        id: Date.now().toString(),
        lead_id: leadId,
        name: newContact.name,
        email: newContact.email || undefined,
        phone: newContact.phone || undefined,
        position: newContact.position || undefined,
        department: newContact.department || undefined,
        notes: newContact.notes || undefined,
        is_primary: newContact.is_primary,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setContacts(prev => [...prev, mockContact]);
      setNewContact({
        name: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        notes: '',
        is_primary: false
      });
      setIsAddingContact(false);
    } catch (err) {
      console.error('Erro ao adicionar contato:', err);
      setError('Erro ao adicionar contato');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    setContacts(prev => prev.filter(c => c.id !== contactId));
  };

  const handleSetPrimary = async (contactId: string) => {
    setContacts(prev => prev.map(contact => ({
      ...contact,
      is_primary: contact.id === contactId
    })));
  };

  const getContactTypeIcon = (contact: LeadContact) => {
    if (contact.is_primary) return Star;
    if (contact.email) return Mail;
    if (contact.phone) return Phone;
    return User;
  };

  const getContactTypeColor = (contact: LeadContact) => {
    if (contact.is_primary) return 'text-yellow-600 dark:text-yellow-400';
    if (contact.email) return 'text-blue-600 dark:text-blue-400';
    if (contact.phone) return 'text-green-600 dark:text-green-400';
    return 'text-muted-foreground';
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Contatos</h3>
          <Button
            onClick={() => setIsAddingContact(true)}
            className="flex items-center gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Adicionar Contato
          </Button>
        </div>

        {error && (
          <div className="mt-4 text-sm text-destructive">{error}</div>
        )}
      </div>

      {/* Contacts List */}
      <div className="p-4">
        {/* Add Contact Form */}
        {isAddingContact && (
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Novo Contato</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingContact(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="position">Cargo</Label>
                  <Input
                    id="position"
                    value={newContact.position}
                    onChange={(e) => setNewContact(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Ex: Gerente"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    value={newContact.department}
                    onChange={(e) => setNewContact(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Ex: Vendas"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={newContact.notes}
                  onChange={(e) => setNewContact(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Informações adicionais sobre o contato"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={newContact.is_primary}
                  onChange={(e) => setNewContact(prev => ({ ...prev, is_primary: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="is_primary">Contato principal</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddContact}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingContact(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map(contact => {
            const TypeIcon = getContactTypeIcon(contact);

            return (
              <Card key={contact.id} className="transition-all hover:shadow-md">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TypeIcon
                        className={cn('h-6 w-6', getContactTypeColor(contact))}
                      />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {contact.name}
                        </h4>
                        {contact.position && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {contact.position}
                            {contact.department && ` • ${contact.department}`}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {contact.is_primary && (
                        <Badge variant="default" className="text-xs">
                          Principal
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteContact(contact.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {contact.email}
                        </a>
                      </div>
                    )}

                    {contact.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-green-600" />
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-green-600 hover:underline"
                        >
                          {contact.phone}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>Adicionado em {formatDate(contact.created_at)}</span>
                    </div>
                  </div>

                  {contact.notes && (
                    <div className="mt-2 p-2 bg-muted rounded-md">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {contact.notes}
                      </p>
                    </div>
                  )}

                  {!contact.is_primary && (
                    <div className="mt-3 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetPrimary(contact.id)}
                        className="w-full"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Definir como Principal
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {contacts.length === 0 && !isAddingContact && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum contato ainda
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Adicione contatos relacionados a este lead para facilitar a comunicação
            </p>
            <Button onClick={() => setIsAddingContact(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Contato
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
export interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  platform?: string;
  channel?: string;
  campaign?: string;
  source_url?: string;
  message?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  column_id?: string;
  position: number;
  won_reason?: string;
  lost_reason?: string;
  value?: number;
  notes?: string;
  metadata?: Record<string, any>;
  account_id: string;
  assigned_to_user_id?: string;
  assignedUser?: User;
  createdAt: string;
  updatedAt: string;
  column?: KanbanColumn;
  tags?: Tag[];
}

export interface KanbanColumn {
  id: string;
  name: string;
  position: number;
  color: string;
  is_system: boolean;
  is_active: boolean;
  account_id: string;
  leads?: Lead[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  account_id: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  is_active: boolean;
  account_id: string;
}

export interface KanbanBoard {
  columns: KanbanColumn[];
  account: {
    id: string;
    name: string;
  };
}

export interface CreateLeadDto {
  name: string;
  phone?: string;
  email?: string;
  platform?: string;
  channel?: string;
  campaign?: string;
  source_url?: string;
  message?: string;
  status?: Lead['status'];
  column_id?: string;
  position?: number;
  value?: number;
  notes?: string;
  assigned_to_user_id?: string;
  tags?: string[];
}

export interface UpdateLeadDto extends Partial<CreateLeadDto> {}

export interface CreateColumnDto {
  name: string;
  color?: string;
}

export interface UpdateColumnDto extends Partial<CreateColumnDto> {
  position?: number;
}

export interface MoveLeadDto {
  column_id: string;
  position: number;
}

export interface ReorderColumnsDto {
  columnOrders: Array<{
    id: string;
    position: number;
  }>;
}
import { apiService } from './api';

export interface UserDto { id: string; name: string; email: string; role?: string; is_active?: boolean; account_id?: string; }
export interface CreateUserInput { name: string; email: string; password: string; role?: 'admin' | 'member'; }
export interface UpdateUserInput { name?: string; password?: string; role?: 'admin' | 'member'; is_active?: boolean; }

interface ListResponse { users: UserDto[] }
interface SingleResponse { user: UserDto }

export const userService = {
  list: async (): Promise<UserDto[]> => {
    const res = await apiService.get<ListResponse>('/api/users');
    return (res.data && (res.data as any).users) || [];
  },
  create: async (data: CreateUserInput): Promise<UserDto> => {
    const res = await apiService.post<SingleResponse>('/api/users', data);
    return (res.data as any).user;
  },
  update: async (id: string, data: UpdateUserInput): Promise<UserDto> => {
    const res = await apiService.put<SingleResponse>(`/api/users/${id}`, data);
    return (res.data as any).user;
  },
  remove: async (id: string): Promise<any> => {
    const res = await apiService.delete<any>(`/api/users/${id}`);
    return res.data;
  }
};

export default userService;

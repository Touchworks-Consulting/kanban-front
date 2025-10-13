import { apiService } from './api';
import { API_ENDPOINTS } from '../constants';

export interface UserDto { id: string; name: string; email: string; phone?: string; role?: string; is_active?: boolean; account_id?: string; }
export interface CreateUserInput { name: string; email: string; password: string; phone: string; role?: 'admin' | 'member'; account_id?: string; }
export interface UpdateUserInput { name?: string; password?: string; phone?: string; role?: 'admin' | 'member'; is_active?: boolean; }

interface ListResponse { users: UserDto[] }
interface SingleResponse { user: UserDto }

export const userService = {
  list: async (): Promise<UserDto[]> => {
    const res = await apiService.get<ListResponse>(API_ENDPOINTS.USERS);
    return (res.data && (res.data as any).users) || [];
  },
  create: async (data: CreateUserInput): Promise<UserDto> => {
    const res = await apiService.post<SingleResponse>(API_ENDPOINTS.USERS, data);
    return (res.data as any).user;
  },
  update: async (id: string, data: UpdateUserInput): Promise<UserDto> => {
    const res = await apiService.put<SingleResponse>(API_ENDPOINTS.USER_BY_ID(id), data);
    return (res.data as any).user;
  },
  remove: async (id: string): Promise<any> => {
    const res = await apiService.delete<any>(API_ENDPOINTS.USER_BY_ID(id));
    return res.data;
  },
  resetPassword: async (id: string, newPassword: string): Promise<any> => {
    const res = await apiService.put<any>(`${API_ENDPOINTS.USER_BY_ID(id)}/reset-password`, { newPassword });
    return res.data;
  }
};

export default userService;

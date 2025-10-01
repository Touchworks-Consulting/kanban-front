import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import { LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from '../mode-toggle';
import NotificationHeader from '../header/NotificationHeader';

const getPageTitle = (pathname: string) => {
  switch (pathname) {
    case '/dashboard':
      return 'Dashboard';
    case '/kanban':
      return 'Kanban';
    case '/campaigns':
      return 'Campanhas';
    case '/settings':
      return 'Configurações';
    default:
      return 'Dashboard';
  }
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, account, token } = useAuthStore();
  const pageTitle = getPageTitle(location.pathname);

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  return (
    <header className="bg-background p-4 h-16 flex items-center justify-between">
      <h1 className="text-xl font-semibold">{pageTitle}</h1>
      <div className="flex items-center space-x-4">
        {token && account?.id && (
          <NotificationHeader />
        )}
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src={account?.avatarUrl} alt={account?.name} />
              <AvatarFallback>{getInitials(account?.name)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/plans')}>
              Planos
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;

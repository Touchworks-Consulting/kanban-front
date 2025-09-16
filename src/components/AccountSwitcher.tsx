import React, { useState, useEffect } from 'react';
import { ChevronDown, Building2, Plus, Settings, Check } from 'lucide-react';
import { useAccountStore } from '../stores/useAccountStore';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

interface AccountSwitcherProps {
  onCreateAccount?: () => void;
  onManageAccounts?: () => void;
  className?: string;
  collapsed?: boolean;
}

export const AccountSwitcher: React.FC<AccountSwitcherProps> = ({
  onCreateAccount,
  onManageAccounts,
  className,
  collapsed = false
}) => {
  const { 
    currentAccount, 
    accounts, 
    loading, 
    error, 
    fetchAccounts, 
    fetchCurrentAccount, 
    switchAccount,
    clearError 
  } = useAccountStore();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchCurrentAccount();
    fetchAccounts();
  }, [fetchCurrentAccount, fetchAccounts]);

  const handleSwitchAccount = async (accountId: string) => {
    if (accountId === currentAccount?.id) return;
    
    await switchAccount(accountId);
    setIsOpen(false);
  };

  const getPlanColor = (plan: string) => {
    const colors = {
      free: 'bg-gray-100 text-gray-700',
      basic: 'bg-blue-100 text-blue-700',
      pro: 'bg-purple-100 text-purple-700',
      enterprise: 'bg-gold-100 text-gold-700'
    };
    return colors[plan as keyof typeof colors] || colors.free;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return '👑';
      case 'admin':
        return '⚙️';
      default:
        return '👤';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!currentAccount) {
    if (collapsed) {
      return (
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-8 h-8 p-0 rounded-full", className)}
          onClick={onCreateAccount}
          disabled={loading}
        >
          <Plus className="h-4 w-4" />
        </Button>
      );
    }

    return (
      <div className={cn("flex flex-col gap-2 p-2 rounded-lg bg-muted max-w-full", className)}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
          <div className="space-y-1 flex-1 min-w-0">
            <div className="h-3 bg-gray-200 rounded animate-pulse max-w-[80px]" />
            <div className="h-2 bg-gray-200 rounded animate-pulse max-w-[60px]" />
          </div>
        </div>
        {onCreateAccount && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs min-h-[28px]"
            onClick={onCreateAccount}
            disabled={loading}
          >
            <Plus className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">Criar Primeira Conta</span>
          </Button>
        )}
      </div>
    );
  }

  if (collapsed) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <div className="relative group">
            <Button
              variant="ghost"
              className={cn(
                "w-10 h-10 p-0 rounded-full",
                "hover:bg-accent/50 transition-colors",
                className
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentAccount.avatar_url} />
                <AvatarFallback className="text-xs">
                  {getInitials(currentAccount.display_name)}
                </AvatarFallback>
              </Avatar>
            </Button>

            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[9999] border border-border shadow-lg">
              {currentAccount.display_name}
            </div>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-80"
          align="start"
          side="right"
        >
          <DropdownMenuLabel className="pb-2">
            <div className="flex items-center justify-between">
              <span>Contas</span>
              {accounts.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'}
                </span>
              )}
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Current Account */}
          <div className="px-2 py-1">
            <div className="text-xs text-muted-foreground mb-2">Conta Atual</div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/30 border">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentAccount.avatar_url} />
                <AvatarFallback className="text-xs">
                  {getInitials(currentAccount.display_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate flex items-center gap-2">
                  {currentAccount.display_name}
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {currentAccount.description || 'Sem descrição'}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <Badge variant="secondary" className={cn("text-xs py-0 px-1", getPlanColor(currentAccount.plan))}>
                  {currentAccount.plan}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {getRoleIcon(currentAccount.role)} {currentAccount.role}
                </span>
              </div>
            </div>
          </div>

          {/* Other Accounts */}
          {accounts.filter(account => account.id !== currentAccount.id).length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1">
                <div className="text-xs text-muted-foreground mb-2">Outras Contas</div>
                {accounts.filter(account => account.id !== currentAccount.id).map((account) => (
                  <DropdownMenuItem
                    key={account.id}
                    className="p-2 cursor-pointer"
                    onClick={() => handleSwitchAccount(account.id)}
                    disabled={loading}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={account.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {getInitials(account.display_name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {account.display_name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {account.description || 'Sem descrição'}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-xs py-0 px-1">
                          {account.plan}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {getRoleIcon(account.role)} {account.role}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </>
          )}

          <DropdownMenuSeparator />

          {/* Actions */}
          {onCreateAccount && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                onCreateAccount();
                setIsOpen(false);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Nova Conta
            </DropdownMenuItem>
          )}

          {onManageAccounts && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                onManageAccounts();
                setIsOpen(false);
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Gerenciar Contas
            </DropdownMenuItem>
          )}

          {error && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-2">
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 px-2 py-2 h-auto",
            "hover:bg-accent/50 transition-colors",
            className
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentAccount.avatar_url} />
            <AvatarFallback className="text-xs">
              {getInitials(currentAccount.display_name)}
            </AvatarFallback>
          </Avatar>

          {!collapsed && (
            <div className="flex-1 text-left min-w-0">
              <div className="font-medium text-sm truncate">
                {currentAccount.display_name}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{getRoleIcon(currentAccount.role)}</span>
                <span className="truncate">{currentAccount.role}</span>
                <Badge variant="secondary" className={cn("text-xs py-0 px-1", getPlanColor(currentAccount.plan))}>
                  {currentAccount.plan}
                </Badge>
              </div>
            </div>
          )}

          {!collapsed && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="w-80" 
        align="start"
        side="bottom"
      >
        <DropdownMenuLabel className="pb-2">
          <div className="flex items-center justify-between">
            <span>Contas</span>
            {accounts.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Current Account */}
        <div className="px-2 py-1">
          <div className="text-xs text-muted-foreground mb-2">Conta Atual</div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/30 border">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentAccount.avatar_url} />
              <AvatarFallback className="text-xs">
                {getInitials(currentAccount.display_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate flex items-center gap-2">
                {currentAccount.display_name}
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {currentAccount.description || 'Sem descrição'}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <Badge variant="secondary" className={cn("text-xs py-0 px-1", getPlanColor(currentAccount.plan))}>
                {currentAccount.plan}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {getRoleIcon(currentAccount.role)} {currentAccount.role}
              </span>
            </div>
          </div>
        </div>

        {/* Other Accounts */}
        {accounts.filter(account => account.id !== currentAccount.id).length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1">
              <div className="text-xs text-muted-foreground mb-2">Outras Contas</div>
              {accounts.filter(account => account.id !== currentAccount.id).map((account) => (
                <DropdownMenuItem
                  key={account.id}
                  className="p-2 cursor-pointer"
                  onClick={() => handleSwitchAccount(account.id)}
                  disabled={loading}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={account.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {getInitials(account.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {account.display_name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {account.description || 'Sem descrição'}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="text-xs py-0 px-1">
                        {account.plan}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getRoleIcon(account.role)} {account.role}
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Actions */}
        {onCreateAccount && (
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => {
              onCreateAccount();
              setIsOpen(false);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Nova Conta
          </DropdownMenuItem>
        )}

        {onManageAccounts && (
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => {
              onManageAccounts();
              setIsOpen(false);
            }}
          >
            <Settings className="h-4 w-4 mr-2" />
            Gerenciar Contas
          </DropdownMenuItem>
        )}
        
        {error && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-2">
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  KanbanSquare,
  Megaphone,
  Settings,
  Users,
  PanelLeftClose,
  PanelRightClose,
} from 'lucide-react';
import { AccountSwitcher } from '../AccountSwitcher';
import { CreateAccountModal } from '../CreateAccountModal';

const navItems = [
  { icon: LayoutDashboard, text: 'Dashboard', path: '/dashboard' },
  { icon: KanbanSquare, text: 'Leads', path: '/kanban' },
  { icon: Megaphone, text: 'Campanhas', path: '/campaigns' },
  { icon: Users, text: 'Usuários', path: '/users' },
  { icon: Settings, text: 'Configurações', path: '/settings' },
];

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const location = useLocation();

  const sidebarVariants = {
    expanded: { width: '240px' },
    collapsed: { width: '68px' },
  };

  return (
    <motion.aside
      animate={isExpanded ? 'expanded' : 'collapsed'}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-background text-foreground h-screen flex flex-col"
    >
      <div className="flex items-center p-4 h-16">
        <div className="flex items-center">
          <img src="/logo.svg" alt="Touch Run" className="h-8 w-8 flex-shrink-0" />
          <motion.div
            animate={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <span className="font-bold text-lg whitespace-nowrap ml-3">Touch Run</span>
          </motion.div>
        </div>
      </div>

      {/* Account Switcher */}
      <div className="px-3 py-2 border-b border-border">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-muted/30 rounded-lg p-2 mb-2"
            >
              <div className="text-xs text-muted-foreground mb-1">Conta Atual</div>
              <AccountSwitcher
                onCreateAccount={() => setShowCreateAccount(true)}
                collapsed={false}
                className="w-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
        {!isExpanded && (
          <div className="flex justify-center">
            <div className="w-10 h-10 flex items-center justify-center">
              <AccountSwitcher
                onCreateAccount={() => setShowCreateAccount(true)}
                collapsed={true}
                className="min-w-0"
              />
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-2">
        {navItems.map((item) => (
          <motion.div
            key={item.text}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Link
              to={item.path}
              className={`flex items-center p-3 rounded-md transition-colors group relative ${
                location.pathname === item.path
                  ? 'bg-muted text-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto', marginLeft: '1rem' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-medium overflow-hidden whitespace-nowrap"
                  >
                    {item.text}
                  </motion.span>
                )}
              </AnimatePresence>
              {!isExpanded && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[9999] border border-border shadow-lg">
                  {item.text}
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center p-3 rounded-md w-full hover:bg-accent transition-colors"
        >
          <div className="flex-shrink-0">
            {isExpanded ? <PanelLeftClose size={20} /> : <PanelRightClose size={20} />}
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto', marginLeft: '1rem' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium overflow-hidden whitespace-nowrap"
              >
                Recolher
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Create Account Modal */}
      <CreateAccountModal
        isOpen={showCreateAccount}
        onClose={() => setShowCreateAccount(false)}
      />
    </motion.aside>
  );
};

export default Sidebar;

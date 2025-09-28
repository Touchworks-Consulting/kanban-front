import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  LayoutDashboard,
  KanbanSquare,
  Megaphone,
  Settings,
  Users,
  ThumbsUp,
  PanelLeftClose,
  PanelRightClose,
} from 'lucide-react';
import { AccountSwitcher } from '../AccountSwitcher';
import { CreateAccountModal } from '../CreateAccountModal';

type NavItem = {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  path: string;
  isNew?: boolean;
};

const navItems: NavItem[] = [
  { icon: LayoutDashboard, text: 'Dashboard', path: '/dashboard' },
  { icon: KanbanSquare, text: 'Leads', path: '/kanban' },
  { icon: Megaphone, text: 'Campanhas', path: '/campaigns' },
  { icon: Users, text: 'Usuários', path: '/users' },
  { icon: Settings, text: 'Configurações', path: '/settings' },
  { icon: ThumbsUp, text: 'Feedbacks', path: '/feedbacks', isNew: true },
];

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<{text: string, rect: DOMRect, isNew?: boolean} | null>(null);
  const location = useLocation();

  const sidebarVariants = {
    expanded: { width: '240px' },
    collapsed: { width: '68px' },
  };

  const handleMouseEnter = (event: React.MouseEvent, text: string, isNew?: boolean) => {
    if (!isExpanded) {
      const rect = event.currentTarget.getBoundingClientRect();
      setActiveTooltip({ text, rect, isNew });
    }
  };

  const handleMouseLeave = () => {
    setActiveTooltip(null);
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
              onMouseEnter={(e) => handleMouseEnter(e, item.text, item.isNew)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="relative flex-shrink-0">
                <item.icon className="h-5 w-5" />
                {item.isNew && !isExpanded && (
                  <div className="absolute -top-0.5 -right-0.5 px-1 py-0.5 bg-red-500 text-white text-[8px] font-medium rounded-full min-w-[16px] h-4 flex items-center justify-center">
                    N
                  </div>
                )}
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto', marginLeft: '1rem' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between overflow-hidden whitespace-nowrap flex-1"
                  >
                    <span className="text-sm font-medium">
                      {item.text}
                    </span>
                    {item.isNew && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full font-medium">
                        Novo
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
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

      {/* Portal Tooltip - Rendered outside sidebar to avoid z-index issues */}
      {activeTooltip && createPortal(
        <div
          className="fixed px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md border border-border shadow-lg pointer-events-none z-[999999]"
          style={{
            left: activeTooltip.rect.right + 8,
            top: activeTooltip.rect.top + (activeTooltip.rect.height / 2) - 16,
          }}
        >
          <div className="flex items-center gap-2">
            {activeTooltip.text}
            {activeTooltip.isNew && (
              <span className="px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full font-medium">
                Novo
              </span>
            )}
          </div>
        </div>,
        document.body
      )}
    </motion.aside>
  );
};

export default Sidebar;

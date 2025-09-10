import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  KanbanSquare,
  Megaphone,
  Settings,
  PanelLeftClose,
  PanelRightClose,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, text: 'Dashboard', path: '/dashboard' },
  { icon: KanbanSquare, text: 'Kanban', path: '/kanban' },
  { icon: Megaphone, text: 'Campanhas', path: '/campaigns' },
  { icon: Settings, text: 'Configurações', path: '/settings' },
];

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
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
         <motion.div animate={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? 'auto' : 0 }} className="overflow-hidden">
            <span className="font-bold text-lg whitespace-nowrap">Kanban Touch</span>
        </motion.div>
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
                <div className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
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
    </motion.aside>
  );
};

export default Sidebar;

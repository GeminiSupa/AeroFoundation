import { 
  LayoutDashboard, Users, Bot, Calendar, ClipboardList, 
  DollarSign, FileText, Settings, BookOpen, LogOut,
  ChevronLeft, ChevronRight, BookOpenCheck, UserCheck, CreditCard, CalendarDays,
  Briefcase, Package, Megaphone, Shield, CheckSquare, FolderOpen, Lightbulb, MessageSquare
} from 'lucide-react';
import { Button } from '../ui/button';
import { useApp } from '../../context/AppContext';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '../../types';
import { supabase } from '../../lib/supabaseClient';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  page: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', page: 'dashboard', roles: ['admin', 'teacher', 'student', 'parent'] },
  
  // Admin modules
  { icon: <Users className="w-5 h-5" />, label: 'Users', page: 'users', roles: ['admin'] },
  { icon: <Briefcase className="w-5 h-5" />, label: 'HR & Staff', page: 'hr-staff', roles: ['admin'] },
  { icon: <Package className="w-5 h-5" />, label: 'Inventory', page: 'inventory', roles: ['admin'] },
  { icon: <Bot className="w-5 h-5" />, label: 'AI Tools', page: 'ai-tools', roles: ['admin'] },
  { icon: <Calendar className="w-5 h-5" />, label: 'Classes', page: 'classes', roles: ['admin', 'teacher'] },
  { icon: <ClipboardList className="w-5 h-5" />, label: 'Scheduling', page: 'scheduling', roles: ['admin'] },
  { icon: <ClipboardList className="w-5 h-5" />, label: 'Leave Management', page: 'leave', roles: ['admin', 'teacher'] },
  { icon: <DollarSign className="w-5 h-5" />, label: 'Finance & Payroll', page: 'finance', roles: ['admin'] },
  { icon: <FileText className="w-5 h-5" />, label: 'Reports', page: 'reports', roles: ['admin'] },
  { icon: <Shield className="w-5 h-5" />, label: 'Audit Logs', page: 'audit-logs', roles: ['admin'] },
  
  // Teacher modules
  { icon: <Lightbulb className="w-5 h-5" />, label: 'Lesson Planning', page: 'lesson-planning', roles: ['teacher'] },
  
  // Student-specific pages
  { icon: <CheckSquare className="w-5 h-5" />, label: 'My To-Do', page: 'todo', roles: ['student'] },
  { icon: <BookOpenCheck className="w-5 h-5" />, label: 'My Grades', page: 'grades', roles: ['student'] },
  { icon: <UserCheck className="w-5 h-5" />, label: 'My Attendance', page: 'attendance', roles: ['student'] },
  { icon: <FolderOpen className="w-5 h-5" />, label: 'Portfolio', page: 'portfolio', roles: ['student'] },
  { icon: <CalendarDays className="w-5 h-5" />, label: 'Apply Leave', page: 'leave', roles: ['student'] },
  
  // Parent-specific pages
  { icon: <BookOpenCheck className="w-5 h-5" />, label: "Child's Progress", page: 'progress', roles: ['parent'] },
  { icon: <CalendarDays className="w-5 h-5" />, label: 'Apply Leave', page: 'leave', roles: ['parent'] },
  
  // Global modules
  { icon: <Megaphone className="w-5 h-5" />, label: 'Announcements', page: 'announcements', roles: ['admin', 'teacher', 'student', 'parent'] },
  { icon: <MessageSquare className="w-5 h-5" />, label: 'Messages', page: 'messages', roles: ['admin', 'teacher', 'student', 'parent'] },
  
  { icon: <Settings className="w-5 h-5" />, label: 'Settings', page: 'settings', roles: ['admin'] },
];

export function Sidebar() {
  const { user, setUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const userMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0D6EFD] rounded-lg flex items-center justify-center">
              <span className="text-white">AI</span>
            </div>
            <span>SMS</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {userMenuItems.map((item) => {
          const path = `/${user.role}-${item.page}`;
          const isActive = location.pathname === path;
          
          return (
            <Button
              key={item.page}
              variant={isActive ? 'secondary' : 'ghost'}
              className={`w-full justify-start ${collapsed ? 'px-2' : ''}`}
              onClick={() => navigate(path)}
            >
              {item.icon}
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      <div className="p-2 border-t border-gray-200 dark:border-gray-800">
        <Button
          variant="ghost"
          className={`w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 ${collapsed ? 'px-2' : ''}`}
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );
}
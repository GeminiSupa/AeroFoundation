import {
  LayoutDashboard, Users, Bot, Calendar, ClipboardList,
  DollarSign, FileText, Settings, BookOpen, UserCheck, BookOpenCheck, CalendarDays,
  Briefcase, Package, Megaphone, Shield, CheckSquare, FolderOpen, Lightbulb, MessageSquare,
  CheckCircle, Building2, CalendarCheck, GraduationCap, HelpCircle
} from 'lucide-react';
import { UserRole } from '../types';

export interface NavMenuItem {
  icon: React.ReactNode;
  label: string;
  page: string;
  roles: UserRole[];
}

export const navMenuItems: NavMenuItem[] = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', page: 'dashboard', roles: ['admin', 'owner', 'super_admin', 'teacher', 'student', 'parent'] },

  { icon: <BookOpen className="w-5 h-5" />, label: '🎓 Learning Hub', page: 'learning-hub', roles: ['admin', 'owner', 'super_admin'] },
  { icon: <GraduationCap className="w-5 h-5" />, label: 'Students', page: 'students', roles: ['admin', 'owner', 'super_admin'] },
  { icon: <UserCheck className="w-5 h-5" />, label: 'Parents', page: 'parents', roles: ['admin', 'owner', 'super_admin'] },
  { icon: <Briefcase className="w-5 h-5" />, label: 'HR & Staff', page: 'hr-staff', roles: ['admin', 'owner', 'super_admin'] },
  { icon: <Package className="w-5 h-5" />, label: 'Inventory', page: 'inventory', roles: ['admin', 'owner', 'super_admin'] },
  { icon: <Bot className="w-5 h-5" />, label: 'AI Tools', page: 'ai-tools', roles: ['admin', 'owner', 'super_admin'] },
  { icon: <CheckCircle className="w-5 h-5" />, label: 'Attendance Report', page: 'attendance', roles: ['admin', 'owner', 'super_admin'] },
  { icon: <CalendarCheck className="w-5 h-5" />, label: 'Leave Requests', page: 'leave-admin', roles: ['admin', 'owner', 'super_admin'] },
  { icon: <DollarSign className="w-5 h-5" />, label: 'Finance & Payroll', page: 'finance', roles: ['admin', 'owner', 'super_admin'] },
  { icon: <FileText className="w-5 h-5" />, label: 'Reports', page: 'reports', roles: ['admin', 'owner', 'super_admin'] },

  { icon: <BookOpen className="w-5 h-5" />, label: '🎓 Learning Hub', page: 'learning-hub', roles: ['teacher'] },
  { icon: <Calendar className="w-5 h-5" />, label: 'My Schedule', page: 'schedule', roles: ['teacher'] },
  { icon: <Lightbulb className="w-5 h-5" />, label: 'Lesson Planning', page: 'lesson-planning', roles: ['teacher'] },
  { icon: <CalendarDays className="w-5 h-5" />, label: 'My Leave', page: 'leave', roles: ['teacher'] },
  { icon: <Building2 className="w-5 h-5" />, label: 'Book Facility', page: 'facility-booking', roles: ['teacher'] },

  { icon: <BookOpen className="w-5 h-5" />, label: '🎓 Learning Hub', page: 'learning-hub', roles: ['student'] },
  { icon: <Calendar className="w-5 h-5" />, label: 'My Schedule', page: 'schedule', roles: ['student'] },
  { icon: <CheckSquare className="w-5 h-5" />, label: 'My To-Do', page: 'todo', roles: ['student'] },
  { icon: <BookOpenCheck className="w-5 h-5" />, label: 'My Grades', page: 'grades', roles: ['student'] },
  { icon: <UserCheck className="w-5 h-5" />, label: 'My Attendance', page: 'attendance', roles: ['student'] },
  { icon: <FolderOpen className="w-5 h-5" />, label: 'Portfolio', page: 'portfolio', roles: ['student'] },
  { icon: <CalendarDays className="w-5 h-5" />, label: 'My Leave', page: 'leave', roles: ['student'] },

  { icon: <BookOpen className="w-5 h-5" />, label: '👨‍👩‍👧‍👦 Family Learning Hub', page: 'learning-hub', roles: ['parent'] },
  { icon: <Calendar className="w-5 h-5" />, label: 'Schedule', page: 'schedule', roles: ['parent'] },
  { icon: <BookOpenCheck className="w-5 h-5" />, label: "Child's Progress", page: 'progress', roles: ['parent'] },
  { icon: <CalendarDays className="w-5 h-5" />, label: 'Leave Requests', page: 'leave', roles: ['parent'] },
  { icon: <DollarSign className="w-5 h-5" />, label: 'Fees', page: 'fees', roles: ['parent'] },

  { icon: <Megaphone className="w-5 h-5" />, label: 'Announcements', page: 'announcements', roles: ['admin', 'owner', 'super_admin', 'teacher', 'student', 'parent'] },
  { icon: <MessageSquare className="w-5 h-5" />, label: 'Messages', page: 'messages', roles: ['admin', 'owner', 'super_admin', 'teacher', 'student', 'parent'] },
  { icon: <Settings className="w-5 h-5" />, label: 'Settings', page: 'settings', roles: ['admin', 'owner', 'super_admin', 'teacher', 'student', 'parent'] },
  { icon: <HelpCircle className="w-5 h-5" />, label: 'Help & Manual', page: 'manual', roles: ['admin', 'owner', 'super_admin', 'teacher', 'student', 'parent'] },
];

export function getNavPath(role: UserRole, page: string): string {
  // owner and super_admin use admin-* paths
  const pathRole = role === 'owner' || role === 'super_admin' ? 'admin' : role;
  if (page === 'facility-booking') return '/facility-booking';
  if (page === 'dashboard') return `/${pathRole}-dashboard`;
  if (page === 'announcements') return `/${pathRole}-announcements`;
  if (page === 'messages') return `/${pathRole}-messages`;
  if (page === 'leave-admin') return '/admin-leave';
  if (page === 'learning-hub') return `/${pathRole}-learning-hub`;
  if (page === 'leave') return `/${pathRole}-leave`;
  if (page === 'settings') return `/${pathRole}-settings`;
  if (page === 'manual') return `/${pathRole}-manual`;
  if (page === 'schedule') return `/${pathRole}-schedule`;
  return `/${pathRole}-${page}`;
}

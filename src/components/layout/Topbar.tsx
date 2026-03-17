 'use client';

import { Bell, Search, HelpCircle, Moon, Sun, X, BookOpen, Users, DollarSign, ClipboardList } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useApp } from '../../context/AppContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { MobileNav } from './MobileNav';
import { useQuery } from '@tanstack/react-query';
import { getUnreadCount } from '../../lib/api/communication';
import { getNavPath } from '../../config/navMenu';
import { getSchoolLogoUrl, SCHOOL_LOGO_CHANGED_EVENT } from '../../utils/schoolBranding';
import { getDashboardRole } from '../../utils/roles';
import { useState, useEffect } from 'react';

export function Topbar() {
  const { user, theme, toggleTheme, setUser } = useApp();
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(getSchoolLogoUrl());

  useEffect(() => {
    const onLogoChange = () => setLogoUrl(getSchoolLogoUrl());
    window.addEventListener(SCHOOL_LOGO_CHANGED_EVENT, onLogoChange);
    return () => window.removeEventListener(SCHOOL_LOGO_CHANGED_EVENT, onLogoChange);
  }, []);
  
  // Fetch real unread message count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadCount', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const res = await getUnreadCount(user.id);
      return res.success ? (res.data || 0) : 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  if (!user) return null;

  const handleLogoClick = () => {
    const dashRole = getDashboardRole(user.role);
    router.push(`/${dashRole}-dashboard`);
  };

  const helpTopics = [
    { icon: <BookOpen className="w-5 h-5 text-blue-500" />, title: 'How to use Dashboard', description: 'Navigate your personalised dashboard, view stats, and access quick actions.' },
    { icon: <Users className="w-5 h-5 text-green-500" />, title: 'How to add Students', description: 'Go to Students page → click "Add Student" → fill details and save.' },
    { icon: <DollarSign className="w-5 h-5 text-orange-500" />, title: 'Finance Help', description: 'Record payments, track fee collection stats, and view AI predictions.' },
    { icon: <ClipboardList className="w-5 h-5 text-purple-500" />, title: 'Payroll Help', description: 'Create payroll records, view salary history, and manage employee payments.' },
  ];

  return (
    <>
      <div className="h-14 sm:h-16 bg-card border-b flex items-center justify-between px-3 sm:px-4 md:px-6 gap-2">
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <MobileNav />
        </div>

        {/* Logo (visible on mobile, hidden on md+ where sidebar shows it) */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity shrink-0 md:hidden"
          aria-label="Go to Dashboard"
        >
          {logoUrl ? (
            <img src={logoUrl} alt="School" className="h-8 w-auto max-w-[100px] object-contain" />
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 bg-[#0D6EFD] rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <span className="font-semibold text-sm">SMS</span>
            </div>
          )}
        </button>
        
        <div className="flex items-center flex-1 max-w-xl">
          <div className="relative w-full hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 border-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="shrink-0">
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative touch-manipulation min-h-[44px] min-w-[44px] shrink-0">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-sap-negative text-white">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Messages</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {unreadCount > 0 ? (
                <DropdownMenuItem 
                  onClick={() => router.push(getNavPath(user.role, 'messages'))}
                  className="flex flex-col items-start p-3 cursor-pointer"
                >
                  <p className="text-sm font-medium">You have {unreadCount} unread message{unreadCount > 1 ? 's' : ''}</p>
                  <p className="text-xs text-muted-foreground mt-1">Click to view messages</p>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem 
                  onClick={() => router.push(getNavPath(user.role, 'messages'))}
                  className="flex flex-col items-start p-3 cursor-pointer"
                >
                  <p className="text-sm">No new messages</p>
                  <p className="text-xs text-muted-foreground mt-1">Click to view all messages</p>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(getNavPath(user.role, 'messages'))}>
                Go to Messages
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={() => setHelpOpen(true)} className="shrink-0">
            <HelpCircle className="w-5 h-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 min-h-[44px] min-w-[44px] rounded-full touch-manipulation shrink-0">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p>{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <Badge className="w-fit">{user.role}</Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(getNavPath(user.role, 'settings'))}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                await supabase.auth.signOut();
                setUser(null);
                router.push('/login');
              }}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Help Modal */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Help & Support
            </DialogTitle>
            <DialogDescription>Quick guides to help you navigate the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {helpTopics.map((topic, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                <div className="mt-0.5 shrink-0">{topic.icon}</div>
                <div>
                  <h4 className="font-medium text-sm">{topic.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{topic.description}</p>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Need more help? Contact your system administrator or check the documentation.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

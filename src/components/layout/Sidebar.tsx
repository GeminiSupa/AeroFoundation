 'use client';

import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useApp } from '../../context/AppContext';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { navMenuItems, getNavPath } from '../../config/navMenu';
import { getSchoolLogoUrl, SCHOOL_LOGO_CHANGED_EVENT } from '../../utils/schoolBranding';
import { getDashboardRole } from '../../utils/roles';

export function Sidebar() {
  const { user, setUser } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(getSchoolLogoUrl());

  useEffect(() => {
    const onLogoChange = () => setLogoUrl(getSchoolLogoUrl());
    window.addEventListener(SCHOOL_LOGO_CHANGED_EVENT, onLogoChange);
    return () => window.removeEventListener(SCHOOL_LOGO_CHANGED_EVENT, onLogoChange);
  }, []);

  if (!user) return null;

  const userMenuItems = navMenuItems.filter(item => item.roles.includes(user.role));

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogoClick = () => {
    const dashRole = getDashboardRole(user.role);
    router.push(`/${dashRole}-dashboard`);
  };

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        {!collapsed && (
          <button onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" aria-label="Go to Dashboard">
            {logoUrl ? (
              <img src={logoUrl} alt="School" className="h-8 w-auto max-w-[120px] object-contain" />
            ) : (
              <>
                <div className="w-8 h-8 bg-[#0D6EFD] rounded-lg flex items-center justify-center">
                  <span className="text-white">AI</span>
                </div>
                <span>SMS</span>
              </>
            )}
          </button>
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
          const path = getNavPath(user.role, item.page);
          const isActive = pathname === path;
          return (
            <Button
              key={`${item.page}-${item.label}`}
              variant={isActive ? 'secondary' : 'ghost'}
              className={`w-full justify-start ${collapsed ? 'px-2' : ''}`}
              onClick={() => router.push(path)}
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

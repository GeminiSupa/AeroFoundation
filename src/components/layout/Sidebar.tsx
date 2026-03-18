 'use client';

import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useApp } from '../../context/AppContext';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { navMenuItems, getNavPath } from '../../config/navMenu';
import { getSchoolLogoPath, getSchoolLogoUrl, SCHOOL_LOGO_CHANGED_EVENT, setSchoolLogoUrl } from '../../utils/schoolBranding';
import { getDashboardRole } from '../../utils/roles';

export function Sidebar() {
  const { user, setUser } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(getSchoolLogoUrl());
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);

  useEffect(() => {
    const onLogoChange = () => {
      setLogoLoadFailed(false);
      setLogoUrl(getSchoolLogoUrl());
    };
    window.addEventListener(SCHOOL_LOGO_CHANGED_EVENT, onLogoChange);
    return () => window.removeEventListener(SCHOOL_LOGO_CHANGED_EVENT, onLogoChange);
  }, []);

  useEffect(() => {
    const resolveSignedLogoUrl = async () => {
      if (!logoLoadFailed) return;
      const path = getSchoolLogoPath();
      if (!path) return;
      const { data, error } = await supabase.storage.from('branding').createSignedUrl(path, 60 * 60 * 24);
      if (error || !data?.signedUrl) return;
      setSchoolLogoUrl(data.signedUrl);
      setLogoUrl(data.signedUrl);
      setLogoLoadFailed(false);
    };
    resolveSignedLogoUrl();
  }, [logoLoadFailed]);

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
    <div
      className={[
        collapsed ? 'w-16' : 'w-64',
        'bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/70',
        'border-r',
        'flex flex-col transition-all duration-300',
      ].join(' ')}
    >
      <div className="p-4 border-b flex items-center justify-between">
        {!collapsed && (
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
            aria-label="Go to Dashboard"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="School"
                className="h-8 w-auto max-w-[120px] object-contain"
                onError={() => setLogoLoadFailed(true)}
              />
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-(--sapBrandColor) text-white shadow-sm">
                  <span className="text-white">AS</span>
                </div>
                <span className="font-semibold">Aero School</span>
              </>
            )}
          </button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto rounded-lg hover:bg-muted/60 transition-colors"
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
              variant="ghost"
              className={[
                'w-full justify-start rounded-xl min-h-[44px] touch-manipulation',
                'transition-[background-color,box-shadow,transform] duration-200',
                'hover:bg-muted/60 hover:text-foreground hover:shadow-sm active:scale-[0.99]',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                collapsed ? 'px-2' : '',
                isActive
                  ? 'bg-[linear-gradient(135deg,rgba(13,110,253,0.14),rgba(98,100,217,0.12),rgba(20,184,166,0.10))] border border-border shadow-sm'
                  : 'border border-transparent',
              ].join(' ')}
              onClick={() => router.push(path)}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="ml-3 truncate">{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      <div className="p-2 border-t">
        <Button
          variant="ghost"
          className={[
            'w-full justify-start rounded-xl min-h-[44px] touch-manipulation',
            'text-destructive hover:text-destructive',
            'hover:bg-destructive/10 transition-colors',
            collapsed ? 'px-2' : '',
          ].join(' ')}
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );
}

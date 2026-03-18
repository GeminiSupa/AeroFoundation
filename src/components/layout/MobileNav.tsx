 'use client';

import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabaseClient';
import { navMenuItems, getNavPath } from '../../config/navMenu';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user, setUser } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  if (!user) return null;

  const userMenuItems = navMenuItems.filter(item => item.roles.includes(user.role));

  const handleNavigation = (page: string) => {
    const path = getNavPath(user.role, page);
    router.push(path);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden touch-manipulation min-h-[44px] min-w-[44px]">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(300px,100vw)] p-0 flex flex-col">
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b shrink-0 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/70">
            <div className="w-8 h-8 bg-(--sapBrandColor) rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">AS</span>
            </div>
            <span className="font-semibold">Aero School</span>
          </div>

          <div className="px-4 py-3 shrink-0">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-10 h-10 bg-(--sapBrandColor) rounded-full flex items-center justify-center text-white font-semibold shrink-0 shadow-sm">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
            {userMenuItems.map((item) => {
              const path = getNavPath(user.role, item.page);
              const isActive = pathname === path;
              return (
                <Button
                  key={`${item.page}-${item.label}`}
                  variant="ghost"
                  className={[
                    'w-full justify-start min-h-[44px] touch-manipulation rounded-xl',
                    'transition-[background-color,box-shadow,transform] duration-200',
                    'hover:bg-muted/60 hover:shadow-sm active:scale-[0.99]',
                    isActive
                      ? 'bg-[linear-gradient(135deg,rgba(13,110,253,0.14),rgba(98,100,217,0.12),rgba(20,184,166,0.10))] border border-border shadow-sm'
                      : 'border border-transparent',
                  ].join(' ')}
                  onClick={() => handleNavigation(item.page)}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="ml-3 truncate">{item.label}</span>
                </Button>
              );
            })}
          </nav>

          <div className="p-4 border-t shrink-0">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive min-h-[44px] touch-manipulation rounded-xl hover:bg-destructive/10 transition-colors"
              onClick={async () => {
                await supabase.auth.signOut();
                setUser(null);
                router.push('/login');
                setOpen(false);
              }}
            >
              <span className="ml-3">Logout</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

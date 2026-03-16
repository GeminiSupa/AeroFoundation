import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabaseClient';
import { navMenuItems, getNavPath } from '../../config/navMenu';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user, setUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const userMenuItems = navMenuItems.filter(item => item.roles.includes(user.role));

  const handleNavigation = (page: string) => {
    const path = getNavPath(user.role, page);
    navigate(path);
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
          <div className="flex items-center gap-2 p-4 border-b shrink-0">
            <div className="w-8 h-8 bg-[#0D6EFD] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <span className="font-semibold">SMS</span>
          </div>

          <div className="px-4 py-3 shrink-0">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-10 h-10 bg-[#0D6EFD] rounded-full flex items-center justify-center text-white font-semibold shrink-0">
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
              const isActive = location.pathname === path;
              return (
                <Button
                  key={`${item.page}-${item.label}`}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={`w-full justify-start min-h-[44px] touch-manipulation ${isActive ? 'bg-accent text-accent-foreground' : ''}`}
                  onClick={() => handleNavigation(item.page)}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Button>
              );
            })}
          </nav>

          <div className="p-4 border-t shrink-0">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive min-h-[44px] touch-manipulation"
              onClick={async () => {
                await supabase.auth.signOut();
                setUser(null);
                navigate('/login');
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

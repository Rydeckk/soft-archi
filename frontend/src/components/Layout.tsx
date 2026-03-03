import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Settings, 
  BarChart, 
  Calendar, 
  Sun,
  Moon,
  LogOut, 
  HelpCircle,
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { 
      label: 'Dashboard', 
      path: '/', 
      icon: LayoutDashboard,
      roles: ['EMPLOYEE', 'SECRETARY', 'MANAGER'] 
    },
    { 
      label: 'Historique', 
      path: '/history', 
      icon: Calendar,
      roles: ['EMPLOYEE', 'SECRETARY', 'MANAGER'] 
    },
    { 
      label: 'Administration', 
      path: '/admin', 
      icon: Settings,
      roles: ['SECRETARY'] 
    },
    { 
      label: 'Statistiques', 
      path: '/stats', 
      icon: BarChart,
      roles: ['MANAGER'] 
    },
    { 
      label: 'Aide', 
      path: '/help', 
      icon: HelpCircle,
      roles: ['EMPLOYEE', 'SECRETARY', 'MANAGER'] 
    },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b">
            <Calendar className="h-6 w-6 text-primary mr-2" />
            <span className="text-xl font-bold">Parking App</span>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  location.pathname === item.path
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t space-y-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="w-full justify-start text-muted-foreground"
              onClick={toggleTheme}
            >
              {isDark ? <Sun className="mr-3 h-5 w-5" /> : <Moon className="mr-3 h-5 w-5" />}
              Mode {isDark ? 'Clair' : 'Sombre'}
            </Button>
            <div className="flex items-center px-3 py-2 text-sm">
              <UserIcon className="mr-3 h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col overflow-hidden">
                <span className="font-medium truncate">{user?.name}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.role}</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Se déconnecter
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b bg-card lg:hidden">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-primary mr-2" />
            <span className="text-xl font-bold">Parking App</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

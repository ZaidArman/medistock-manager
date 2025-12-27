import { 
  LayoutDashboard, 
  Pill, 
  PackagePlus, 
  PackageMinus,
  Bell, 
  BarChart3,
  Truck,
  Settings,
  LogOut,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth, AppRole } from '@/contexts/AuthContext';

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles?: AppRole[];
}

const mainNavItems: NavItem[] = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Medicines', url: '/medicines', icon: Pill, roles: ['admin', 'pharmacist', 'store_manager'] },
  { title: 'Stock In', url: '/stock-in', icon: PackagePlus, roles: ['admin', 'pharmacist', 'store_manager'] },
  { title: 'Stock Out', url: '/stock-out', icon: PackageMinus, roles: ['admin', 'pharmacist', 'store_manager'] },
  { title: 'Alerts', url: '/alerts', icon: Bell },
];

const managementItems: NavItem[] = [
  { title: 'Reports', url: '/reports', icon: BarChart3 },
  { title: 'Suppliers', url: '/suppliers', icon: Truck, roles: ['admin', 'store_manager'] },
  { title: 'Settings', url: '/settings', icon: Settings, roles: ['admin'] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { profile, roles, signOut, hasAnyRole } = useAuth();
  const isCollapsed = state === 'collapsed';

  const filterByRole = (items: NavItem[]) => {
    return items.filter(item => {
      if (!item.roles) return true;
      return hasAnyRole(item.roles);
    });
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return 'User';
  };

  const getPrimaryRole = () => {
    if (roles.includes('admin')) return 'Admin';
    if (roles.includes('pharmacist')) return 'Pharmacist';
    if (roles.includes('doctor')) return 'Doctor';
    if (roles.includes('store_manager')) return 'Store Manager';
    return 'Staff';
  };

  const visibleMainItems = filterByRole(mainNavItems);
  const visibleManagementItems = filterByRole(managementItems);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Pill className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sidebar-foreground">MediStock</span>
              <span className="text-xs text-muted">Inventory System</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/'}
                      className="flex items-center gap-3"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {visibleManagementItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleManagementItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink 
                        to={item.url}
                        className="flex items-center gap-3"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-sidebar-foreground">
                {getDisplayName()}
              </span>
              <span className="truncate text-xs text-muted">{getPrimaryRole()}</span>
            </div>
          )}
          {!isCollapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={signOut}
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

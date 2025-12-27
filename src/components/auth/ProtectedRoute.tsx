import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: AppRole[];
  requireAnyRole?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requiredRoles,
  requireAnyRole = true 
}: ProtectedRouteProps) {
  const { user, roles, isLoading, isStaff } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Authenticated but no roles assigned (pending approval)
  if (!isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-4 max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
            <svg className="h-8 w-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-card-foreground">Pending Approval</h2>
          <p className="mb-4 text-muted-foreground">
            Your account is pending role assignment. Please contact an administrator to get access to the system.
          </p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="text-primary hover:underline"
          >
            Sign out and try again
          </button>
        </div>
      </div>
    );
  }

  // Check for required roles if specified
  if (requiredRoles && requiredRoles.length > 0) {
    const hasAccess = requireAnyRole 
      ? requiredRoles.some(role => roles.includes(role))
      : requiredRoles.every(role => roles.includes(role));

    if (!hasAccess) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="mx-4 max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-card-foreground">Access Denied</h2>
            <p className="mb-4 text-muted-foreground">
              You don't have the required permissions to access this page.
            </p>
            <a href="/" className="text-primary hover:underline">
              Return to Dashboard
            </a>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

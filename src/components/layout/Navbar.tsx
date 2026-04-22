import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { auth } from '../../lib/firebase';
import { Button } from '@/components/ui/button';
import { LogOut, User, Landmark } from 'lucide-react';

export default function Navbar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const userRole = profile?.role || (user?.email?.toLowerCase() === 'vinaykoushikkaki@gmail.com' ? 'admin' : null);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Landmark className="w-6 h-6" />
          <span>Smart Campus Share</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <User className="w-4 h-4" />
                <span>{profile?.name || user.email}</span>
                {userRole && (
                  <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded uppercase font-bold text-neutral-500">
                    {userRole}
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

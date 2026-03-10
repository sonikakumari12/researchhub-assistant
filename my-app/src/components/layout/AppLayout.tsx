import type { ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext';

type LayoutProps = {
  children: ReactNode;
};

const navItems = [
  { to: '/home', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/search', label: 'Search Papers' },
  { to: '/ai-tools', label: 'AI Tools' },
  { to: '/upload', label: 'Upload PDF' },
  { to: '/docspace', label: 'DocSpace' },
];

const getInitials = (email: string | null) => {
  if (!email) return 'R';
  const user = email.split('@')[0];
  return user.slice(0, 2).toUpperCase();
};

export const AppLayout = ({ children }: LayoutProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { userEmail, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand">ResearchHub AI</div>
        <nav className="nav-list">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="app-main-wrap">
        <header className="app-header">
          <div className="page-path">{pathname.replace('/', '') || 'home'}</div>
          <div className="user-block">
            <div className="avatar">{getInitials(userEmail)}</div>
            <div>
              <div className="user-name">RK</div>
              <div className="user-email">{userEmail ?? 'rk@gmail.com'}</div>
            </div>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Logout
            </button>
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
};

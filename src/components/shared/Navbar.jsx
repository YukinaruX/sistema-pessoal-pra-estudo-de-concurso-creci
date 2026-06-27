import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, History,
  CalendarDays, RefreshCw, LogOut, Sun, Moon,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../../hooks/useTheme.js';
import Logo from './Logo.jsx';

const LINKS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/simulado', label: 'Simulado', icon: FileText },
  { to: '/historico', label: 'Histórico', icon: History },
  { to: '/plano', label: 'Plano', icon: CalendarDays },
  { to: '/revisao', label: 'Revisão', icon: RefreshCw },
];

export default function Navbar() {
  const { user, sair } = useAuth();
  const { tema, alternarTema } = useTheme();
  const navigate = useNavigate();

  async function handleSair() {
    await sair();
    navigate('/login', { replace: true });
  }

  const linkClass = ({ isActive }) => `nav-link${isActive ? ' ativo' : ''}`;

  return (
    <>
      <header className="navbar">
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 14, height: 54 }}>

          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <Logo size={30} />
            <span style={{
              fontFamily: 'var(--fonte-titulo)',
              fontWeight: 900,
              fontSize: 17,
              color: 'var(--verde)',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
            }}>
              CRECI-BA
            </span>
          </NavLink>

          <nav className="nav-desktop">
            {LINKS.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={linkClass}>
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            <span className="muted-sm nav-email" title={user?.email} style={{
              maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user?.email}
            </span>
            <button
              className="btn btn-fantasma"
              onClick={alternarTema}
              title={tema === 'escuro' ? 'Tema claro' : 'Tema escuro'}
              style={{ padding: '7px 9px' }}
            >
              {tema === 'escuro' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="btn btn-fantasma" onClick={handleSair} title="Sair" style={{ padding: '7px 9px' }}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Barra inferior mobile */}
      <nav className="nav-mobile">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass} style={{ flexDirection: 'column', gap: 3, padding: '6px 4px', flex: 1, justifyContent: 'center', fontSize: 10.5 }}>
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

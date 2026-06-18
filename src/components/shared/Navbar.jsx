import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  History,
  CalendarDays,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

const LINKS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/simulado', label: 'Simulado', icon: FileText },
  { to: '/historico', label: 'Histórico', icon: History },
  { to: '/plano', label: 'Plano', icon: CalendarDays },
  { to: '/revisao', label: 'Revisão', icon: RefreshCw },
];

export default function Navbar() {
  const { user, sair } = useAuth();
  const navigate = useNavigate();

  async function handleSair() {
    await sair();
    navigate('/login', { replace: true });
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        backdropFilter: 'blur(14px)',
        background: 'rgba(15,23,42,0.72)',
        borderBottom: '1px solid var(--borda)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          height: 64,
        }}
      >
        <NavLink
          to="/"
          style={{
            fontFamily: 'var(--fonte-titulo)',
            fontWeight: 800,
            fontSize: 18,
            background: 'var(--gradiente)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            whiteSpace: 'nowrap',
          }}
        >
          CRECI-BA
        </NavLink>

        <nav
          style={{
            display: 'flex',
            gap: 4,
            flex: 1,
            overflowX: 'auto',
          }}
        >
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 12px',
                borderRadius: 'var(--raio-md)',
                fontSize: 14,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                color: isActive ? 'var(--texto)' : 'var(--texto-fraco)',
                background: isActive ? 'rgba(37,99,235,0.18)' : 'transparent',
              })}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="muted-sm" style={{ display: 'none' }} aria-hidden />
          <span
            className="muted-sm"
            title={user?.email}
            style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {user?.email}
          </span>
          <button className="btn btn-fantasma" onClick={handleSair} title="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

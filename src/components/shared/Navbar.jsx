import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, History,
  CalendarDays, RefreshCw, LogOut, Sun, Moon, Gamepad2,
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
  { to: '/jogos', label: 'Jogos', icon: Gamepad2 },
];

export default function Navbar() {
  const { user, sair } = useAuth();
  const { tema, alternarTema } = useTheme();
  const navigate = useNavigate();
  const nome = user?.user_metadata?.nome || user?.email?.split('@')[0] || '';

  async function handleSair() {
    await sair();
    navigate('/login', { replace: true });
  }

  const linkClass = ({ isActive }) => `nav-link${isActive ? ' ativo' : ''}`;

  return (
    <>
      {/* ── Sidebar desktop ── */}
      <aside className="sidebar">
        <NavLink to="/" className="sidebar-logo">
          <Logo size={34} />
          <span className="sidebar-titulo">CRECI-BA</span>
        </NavLink>

        <nav className="sidebar-nav">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-rodape">
          {/* Card do usuário */}
          <div className="sidebar-usuario-card">
            <div className="sidebar-avatar">
              {nome.charAt(0).toUpperCase()}
            </div>
            <span className="sidebar-usuario-nome">{nome}</span>
          </div>

          {/* Ações */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className="btn btn-fantasma sidebar-btn-acao"
              onClick={alternarTema}
              title={tema === 'escuro' ? 'Tema claro' : 'Tema escuro'}
            >
              {tema === 'escuro' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="btn btn-fantasma sidebar-btn-acao"
              onClick={handleSair}
              title="Sair"
            >
              <LogOut size={15} />
              <span style={{ fontSize: 13 }}>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Barra inferior mobile ── */}
      <nav className="nav-mobile">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to} to={to} end={end}
            className={linkClass}
            style={{ flexDirection: 'column', gap: 2, flex: 1, justifyContent: 'center', padding: '6px 2px', fontSize: 9.5 }}
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

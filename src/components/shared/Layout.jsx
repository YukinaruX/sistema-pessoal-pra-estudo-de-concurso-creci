import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

// Casca padrão das páginas autenticadas: navbar fixa + conteúdo.
export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main className="container surgir" style={{ flex: 1, padding: '26px 18px 60px' }}>
        <Outlet />
      </main>
    </div>
  );
}

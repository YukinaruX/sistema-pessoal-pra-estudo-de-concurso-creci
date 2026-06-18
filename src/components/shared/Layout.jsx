import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

// Casca padrão das páginas autenticadas: navbar fixa + conteúdo.
export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main className="container surgir pagina" style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}

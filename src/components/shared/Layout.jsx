import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function Layout() {
  return (
    <div className="layout-root">
      <Navbar />
      <main className="layout-conteudo container surgir pagina">
        <Outlet />
        <div className="nav-mobile-spacer" />
      </main>
    </div>
  );
}

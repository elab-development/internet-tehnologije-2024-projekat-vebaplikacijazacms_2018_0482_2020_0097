import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AppHeader() {
  const { user, logout } = useAuth(); // pristup trenutno ulogovanom korisniku
  const nav = useNavigate();

  return (
    <header className='bg-white shadow'>
      {' '}
      {/* zajednički header za editor/user deo */}
      <div className='max-w-6xl mx-auto px-4 h-14 flex items-center justify-between'>
        {/* Link na početnu (Home odlučuje redirect po ulozi) */}
        <Link to='/' className='text-blue-700 font-semibold'>
          DnD CMS
        </Link>

        <div className='flex items-center gap-3'>
          {/* Ako je korisnik admin, prikaži prečicu ka admin zoni */}
          {user?.role === 'admin' && (
            <Link
              to='/sites'
              className='px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow'
            >
              Admin
            </Link>
          )}

          {/* Logout dugme: očisti sesiju i odvedi na login */}
          <button
            onClick={async () => {
              await logout();
              nav('/login', { replace: true });
            }}
            className='px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-black shadow'
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

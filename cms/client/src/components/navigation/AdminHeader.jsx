import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminHeader() {
  const { user, logout } = useAuth(); // user info i logout iz Auth konteksta
  const nav = useNavigate(); // programatska navigacija

  return (
    <header className='bg-white shadow'>
      {' '}
      {/* gornja traka za admin deo */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between'>
        <div className='text-blue-700 font-semibold'>DnD CMS Admin</div>{' '}
        {/* logo/naslov */}
        <div className='flex items-center gap-4'>
          {/* kratki pozdrav sa imenom korisnika */}
          <span className='text-sm text-gray-600'>
            Hello, <b>{user?.fullName}</b>
          </span>
          {/* izlaz iz naloga + redirect na /login */}
          <button
            onClick={async () => {
              await logout();
              nav('/login', { replace: true });
            }}
            className='px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow'
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

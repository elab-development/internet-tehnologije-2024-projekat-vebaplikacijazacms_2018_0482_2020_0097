import { Outlet, Link, useLocation } from 'react-router-dom';
import AppHeader from '../components/navigation/AppHeader';

// Layout za editora. Ima header i breadcrumb na vrhu.
export default function EditorLayout() {
  const loc = useLocation();
  return (
    <>
      {/* Gornji zajednički header */}
      <AppHeader />
      <div className='max-w-6xl mx-auto px-4 py-6'>
        {/* Mali breadcrumb na vrhu */}
        <div className='mb-4 text-sm text-gray-600 flex items-center gap-2'>
          <Link to='/me' className='hover:underline'>
            My workspace
          </Link>
          <span>/</span>
          {/* Trenutna putanja */}
          <span className='text-gray-400'>{loc.pathname}</span>
        </div>
        {/* Outlet za child rute editora */}
        <Outlet />
      </div>
    </>
  );
}

import { Outlet, NavLink } from 'react-router-dom';
import AdminHeader from '../components/navigation/AdminHeader';
import AdminSidebar from '../components/navigation/AdminSidebar';

// Glavni layout za administratorski deo aplikacije.
// Ima header, levi sidebar i glavni deo sa Outlet za child rute.
export default function AdminLayout() {
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Gornji header specifičan za admin */}
      <AdminHeader />

      {/* Grid: levi sidebar + desni glavni sadržaj */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-12 gap-6'>
        <aside className='col-span-12 md:col-span-3 lg:col-span-3'>
          {/* Sidebar meniji */}
          <AdminSidebar />
        </aside>
        <main className='col-span-12 md:col-span-9 lg:col-span-9'>
          {/* Link za povratak na dashboard */}
          <div className='mb-4 text-sm text-gray-500'>
            <NavLink to='/' className='hover:underline'>
              Dashboard
            </NavLink>
          </div>
          {/* Outlet renderuje child rute (tabovi, stranice) */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

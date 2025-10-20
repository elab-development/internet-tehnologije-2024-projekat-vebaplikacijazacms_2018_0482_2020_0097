import { NavLink } from 'react-router-dom';

const linkBase = 'block px-3 py-2 rounded-lg'; // zajednička klasa za linkove
const active = 'bg-blue-600 text-white shadow'; // stil aktivnog taba
const inactive = 'text-gray-700 hover:bg-blue-50'; // stil neaktivnog taba

export default function AdminSidebar() {
  return (
    <nav className='bg-white rounded-xl shadow p-4 space-y-2'>
      {/* NavLink automatski dodaje isActive na osnovu rute */}
      <NavLink
        to='/admin'
        className={({ isActive }) =>
          `${linkBase} ${isActive ? active : inactive}`
        }
      >
        Dashboard
      </NavLink>

      <NavLink
        to='/sites'
        className={({ isActive }) =>
          `${linkBase} ${isActive ? active : inactive}`
        }
      >
        Sites
      </NavLink>
    </nav>
  );
}

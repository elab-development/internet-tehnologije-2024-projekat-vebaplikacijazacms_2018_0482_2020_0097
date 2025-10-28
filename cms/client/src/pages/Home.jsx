import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Landing stranica nakon logina – odmah preusmerava na dashboard zavisno od role
export default function Home() {
  const { user } = useAuth(); // uzimamo trenutno ulogovanog korisnika
  const navigate = useNavigate(); // hook za navigaciju

  useEffect(() => {
    if (!user) return; // ako se auth još učitava, ne radi ništa
    if (user.role === 'admin') {
      navigate('/admin', { replace: true }); // admin na admin dashboard
    } else {
      navigate('/me', { replace: true }); // ostali na editor workspace
    }
  }, [user, navigate]);

  // fallback UI dok traje redirect (mali loader-like blok)
  return (
    <div className='max-w-4xl mx-auto px-4 py-10'>
      <div className='rounded-xl border border-gray-100 shadow p-6 bg-white text-gray-600'>
        Redirecting…
      </div>
    </div>
  );
}

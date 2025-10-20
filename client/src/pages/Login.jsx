import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

// Stranica za logovanje korisnika
export default function Login() {
  const { login } = useAuth(); // uzimamo login metod iz AuthContext-a
  const nav = useNavigate(); // hook za navigaciju
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(''); // za prikaz greške

  // submit handler forme
  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      // login vraća user objekat iz backend-a
      const u = await login(email, password);
      // redirect na odgovarajuće mesto po ulozi
      if (u?.role === 'admin') nav('/sites', { replace: true });
      else nav('/', { replace: true });
    } catch (error) {
      setErr(error.message || 'Login failed');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6'>
      <form
        onSubmit={onSubmit}
        className='w-full max-w-sm bg-white shadow-lg rounded-xl p-8'
      >
        <h1 className='text-2xl font-semibold mb-6 text-blue-900'>Sign in</h1>

        {/* greška ako login padne */}
        {err && <div className='mb-3 text-sm text-red-600'>{err}</div>}

        {/* email input */}
        <label className='block mb-4'>
          <span className='text-sm text-gray-700'>Email</span>
          <input
            className='mt-1 w-full rounded-lg px-3 py-2 outline-none border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-300'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type='email'
            placeholder='Email Address'
            required
          />
        </label>

        {/* password input */}
        <label className='block mb-6'>
          <span className='text-sm text-gray-700'>Password</span>
          <input
            className='mt-1 w-full rounded-lg px-3 py-2 outline-none border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-300'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type='password'
            placeholder='Password'
            required
          />
        </label>

        {/* dugme za login */}
        <button
          className='w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-colors'
          type='submit'
        >
          Log in
        </button>

        {/* link za register */}
        <p className='mt-5 text-sm text-gray-600 text-center'>
          Don’t have an account?{' '}
          <Link to='/register' className='text-blue-700 underline'>
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}

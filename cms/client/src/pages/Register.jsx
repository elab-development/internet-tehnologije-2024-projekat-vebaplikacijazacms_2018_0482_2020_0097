import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

// Stranica za registraciju korisnika
export default function Register() {
  const { register } = useAuth(); // uzimamo register metod iz AuthContext-a
  const nav = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  // submit handler
  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      // register vraća user objekat iz backend-a
      await register(fullName, email, password);
      // nakon registracije redirect na home
      nav('/', { replace: true });
    } catch (error) {
      setErr(error.message || 'Registration failed');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6'>
      <form
        onSubmit={onSubmit}
        className='w-full max-w-sm bg-white shadow-lg rounded-xl p-8'
      >
        <h1 className='text-2xl font-semibold mb-6 text-blue-900'>
          Create account
        </h1>

        {/* greška ako registracija padne */}
        {err && <div className='mb-3 text-sm text-red-600'>{err}</div>}

        {/* full name input */}
        <label className='block mb-4'>
          <span className='text-sm text-gray-700'>Full name</span>
          <input
            className='mt-1 w-full rounded-lg px-3 py-2 outline-none border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-300'
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder='Full Name'
            required
          />
        </label>

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

        {/* dugme za registraciju */}
        <button
          className='w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-colors'
          type='submit'
        >
          Sign up
        </button>

        {/* link za login */}
        <p className='mt-5 text-sm text-gray-600 text-center'>
          Already have an account?{' '}
          <Link to='/login' className='text-blue-700 underline'>
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

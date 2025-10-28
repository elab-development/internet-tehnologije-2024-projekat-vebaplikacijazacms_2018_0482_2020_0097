import { useLoading } from '../contexts/LoadingContext';
import { useAuth } from '../contexts/AuthContext';

export default function Loader() {
  const { loading } = useLoading();
  const { initializing } = useAuth();

  if (!loading && !initializing) return null;

  return (
    <div className='fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center'>
      <div className='w-14 h-14 rounded-full border-4 border-white/30 border-t-white animate-spin' />
    </div>
  );
}

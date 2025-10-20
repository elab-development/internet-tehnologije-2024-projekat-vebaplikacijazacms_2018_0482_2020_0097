import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiDelete, apiGet } from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { useLoading } from '../../../contexts/LoadingContext';

export default function SitesList() {
  const [items, setItems] = useState([]); // lista sajtova
  const { withLoading } = useLoading();

  // učitaj sajtove
  const fetchSites = async () => {
    const { items } = await withLoading(() => apiGet('/api/sites'));
    setItems(items);
  };

  useEffect(() => {
    fetchSites(); // on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // brisanje sajta + refresh
  const remove = async (id) => {
    await withLoading(() => apiDelete(`/api/sites/${id}`));
    await fetchSites();
  };

  // prazan state
  if (!items.length) {
    return (
      <EmptyState
        title='No sites yet'
        subtitle='Create your first site to get started.'
        action={
          <Link to='/sites/new'>
            <Button>Create site</Button>
          </Link>
        }
      />
    );
  }

  // grid lista sajtova
  return (
    <Card>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-semibold'>Sites</h1>
        <Link to='/sites/new'>
          <Button>New site</Button>
        </Link>
      </div>

      <div className='mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {items.map((s) => (
          <div
            key={s._id}
            className='bg-white rounded-xl border border-gray-100 shadow-sm p-4'
          >
            <div className='flex items-center justify-between'>
              <div>
                <div className='font-medium'>{s.name}</div>
                <div className='text-sm text-gray-500'>
                  {s.template} • {s.isPublished ? 'Published' : 'Draft'}
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Link
                  to={`/sites/${s._id}`}
                  className='px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow'
                >
                  Open
                </Link>
                <ConfirmDialog
                  triggerLabel='Delete'
                  title='Delete site?'
                  body='This will remove the site, its pages and posts.'
                  onConfirm={() => remove(s._id)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import { apiGet } from '../../lib/api';

export default function MySites() {
  const [sites, setSites] = useState([]); // lista sajtova na kojima je korisnik owner/editor

  useEffect(() => {
    (async () => {
      try {
        // dohvat svih korisnikovih sajtova (owner ili editor)
        const { items } = await apiGet('/api/sites');
        setSites(items || []);
      } catch {
        setSites([]); // u slučaju greške prikaži prazno
      }
    })();
  }, []);

  return (
    <Card>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-semibold'>My sites</h1>
      </div>

      {!sites.length ? (
        // empty state ako nema sajtova
        <div className='mt-3 text-gray-600'>No sites yet.</div>
      ) : (
        // grid kartica sa sajtovima
        <div className='mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-3'>
          {sites.map((s) => (
            <Link
              key={s._id}
              // vodi na listu postova za taj site u editor zoni
              to={`/me/sites/${s._id}/posts`}
              className='block rounded-xl border border-gray-100 shadow hover:shadow-md p-4 bg-white'
            >
              <div className='flex items-center justify-between'>
                <div className='font-semibold'>{s.name}</div>
                {/* badge Published/Draft */}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs border ${
                    s.isPublished
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}
                >
                  {s.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className='text-sm text-gray-500 mt-1'>
                Template: {s.template}
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}

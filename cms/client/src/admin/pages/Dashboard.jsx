import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { apiGet } from '../../lib/api';
import { Link } from 'react-router-dom';

// Admin dashboard – overview svih sajtova i recent postova
export default function Dashboard() {
  const [sites, setSites] = useState([]); // lista sajtova
  const [posts, setPosts] = useState([]); // poslednji postovi svih sajtova
  const [loading, setLoading] = useState(true);

  // helper za preview link posta (ka javnom blog postu)
  const previewHref = (p) => {
    const s = p._site;
    if (s?.slug) return `/pub/${s.slug}/blog/${p.slug}`;
    return `/me/posts/${p._id}`;
  };

  useEffect(() => {
    (async () => {
      try {
        const { items } = await apiGet('/api/sites'); // admin vidi svoje sajtove
        setSites(items || []);

        // za svaki sajt povući do 5 postova
        const chunks = await Promise.all(
          (items || []).map(async (s) => {
            const { items: ps } = await apiGet(
              `/api/posts/site/${s._id}?limit=5`
            );
            return ps.map((p) => ({ ...p, _site: s }));
          })
        );
        const flat = chunks
          .flat()
          .sort((a, b) => (a._id < b._id ? 1 : -1))
          .slice(0, 12);
        setPosts(flat);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className='space-y-6'>
      <Card>
        <h1 className='text-xl font-semibold'>Admin dashboard</h1>
        <p className='text-gray-600'>
          Overview of your sites and recent posts.
        </p>
      </Card>

      <Card>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Recent posts</h3>
          {/* link ka menadžmentu sajtova */}
          <Link
            to='/sites'
            className='px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow'
          >
            Manage sites
          </Link>
        </div>

        {loading ? (
          <div className='mt-3 text-gray-500'>Loading…</div>
        ) : !posts.length ? (
          <div className='mt-3 text-gray-600'>No posts yet.</div>
        ) : (
          <div className='mt-4 space-y-2'>
            {posts.map((p) => (
              <div
                key={p._id}
                className='flex items-center justify-between bg-white rounded-lg border border-gray-100 shadow-sm p-3'
              >
                <div>
                  <div className='font-medium'>{p.title}</div>
                  <div className='text-sm text-gray-500'>
                    {p._site?.name} • {p.slug} • {p.status}
                    {p.publishedAt
                      ? ` • ${new Date(p.publishedAt).toLocaleString()}`
                      : ''}
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  {/* otvori editor */}
                  <Link
                    to={`/me/posts/${p._id}`}
                    className='px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow'
                  >
                    Open
                  </Link>
                  {/* preview javne verzije */}
                  <Link
                    to={previewHref(p)}
                    className='px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200'
                    target={p._site?.slug ? '_blank' : undefined}
                    rel='noreferrer'
                  >
                    Preview
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

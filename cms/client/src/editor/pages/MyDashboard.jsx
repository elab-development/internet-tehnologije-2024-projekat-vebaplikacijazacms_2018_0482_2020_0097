import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { apiGet } from '../../lib/api';
import { Link } from 'react-router-dom';

// Editor dashboard – pregled sajtova i poslednjih postova na kojima je editor
export default function MyDashboard() {
  const [sites, setSites] = useState([]); // lista sajtova na kojima je editor
  const [posts, setPosts] = useState([]); // poslednji postovi preko svih sajtova
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // prvo dohvatimo sajtove gde je korisnik editor/owner
        const { items } = await apiGet('/api/sites');
        setSites(items || []);
        // za svaki sajt uzmemo do 5 postova
        const chunks = await Promise.all(
          (items || []).map(async (s) => {
            const { items: ps } = await apiGet(
              `/api/posts/site/${s._id}?limit=5`
            );
            // dodaj _site info na svaki post za lakše prikazivanje
            return ps.map((p) => ({ ...p, _site: s }));
          })
        );
        // flatten i sortiranje svih postova
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

  // helper za generisanje preview linka posta
  const previewHref = (p) => {
    const s = p._site;
    if (s?.slug) {
      // ako ima slug → javni URL
      return `/pub/${s.slug}/blog/${p.slug}`;
    }
    // fallback: nema slug → otvori editor
    return `/me/posts/${p._id}`;
  };

  return (
    <div className='space-y-6'>
      <Card>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-xl font-semibold'>My workspace</h1>
            <p className='text-gray-600'>
              Quick access to your sites and content.
            </p>
          </div>
          {/* link ka listi svih sajtova */}
          <Link
            to='/me/sites'
            className='px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow'
          >
            All my sites
          </Link>
        </div>
      </Card>

      <Card>
        <h3 className='text-lg font-semibold'>Recent posts</h3>
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
                  {/* otvoriti post editor */}
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

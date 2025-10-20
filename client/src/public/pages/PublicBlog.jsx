import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiGet } from '../../lib/api';

export default function PublicBlog() {
  const { siteSlug } = useParams(); // slug sajta iz rute
  const [site, setSite] = useState(null); // meta info sajta (ime/tema)
  const [posts, setPosts] = useState([]); // lista objavljenih postova
  const [cursor, setCursor] = useState(null); // pagination cursor
  const [error, setError] = useState(''); // prikaz greške

  useEffect(() => {
    (async () => {
      try {
        // Dohvati sajt (public metadata + homepage)
        const { site } = await apiGet(`/api/public/${siteSlug}`);
        setSite(site);
        // Inicijalno učitaj objavljene postove
        const { items, nextCursor } = await apiGet(
          `/api/public/${siteSlug}/posts`
        );
        setPosts(items || []);
        setCursor(nextCursor || null);
      } catch (e) {
        setError(e?.message || 'Failed to load');
      }
    })();
  }, [siteSlug]);

  // Load more handler (ako postoji nextCursor)
  const loadMore = async () => {
    if (!cursor) return;
    const { items, nextCursor } = await apiGet(
      `/api/public/${siteSlug}/posts?cursor=${encodeURIComponent(cursor)}`
    );
    setPosts((p) => [...p, ...(items || [])]);
    setCursor(nextCursor || null);
  };

  return (
    <div className='max-w-5xl mx-auto px-4 py-6'>
      {/* Header sa linkom nazad na public home */}
      <div className='flex items-center justify-between'>
        <Link
          to={`/pub/${siteSlug}/blog`}
          className='px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow'
        >
          ← Home
        </Link>
        <h1 className='text-xl font-semibold'>
          {site ? `${site.name} • Blog` : 'Blog'}
        </h1>
        <div />
      </div>

      {error && <div className='mt-4 text-red-600'>{error}</div>}

      {/* Lista kartica sa postovima ili empty state */}
      {!posts.length ? (
        <div className='mt-6 text-gray-600'>No published posts yet.</div>
      ) : (
        <div className='mt-6 grid md:grid-cols-2 gap-4'>
          {posts.map((p) => (
            <Link
              key={p._id}
              to={`/pub/${siteSlug}/blog/${p.slug}`}
              className='block rounded-xl border border-gray-100 bg-white shadow hover:shadow-md overflow-hidden'
            >
              {p.coverImageUrl ? (
                <img
                  src={p.coverImageUrl}
                  alt=''
                  className='w-full h-40 object-cover'
                />
              ) : (
                <div className='w-full h-40 bg-gray-100' />
              )}
              <div className='p-4'>
                <div className='font-semibold'>{p.title}</div>
                <div className='text-sm text-gray-500 mt-1'>{p.excerpt}</div>
                <div className='text-xs text-gray-400 mt-2'>
                  {p.publishedAt
                    ? new Date(p.publishedAt).toLocaleDateString()
                    : ''}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Paginacija (Load more) */}
      {cursor && (
        <div className='mt-6 flex justify-center'>
          <button
            onClick={loadMore}
            className='px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow'
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}

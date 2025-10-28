import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiGet } from '../../lib/api';
import PublicRenderer from '../PublicRenderer';

export default function PublicPost() {
  const { siteSlug, slug } = useParams(); // slug sajta i posta
  const [site, setSite] = useState(null); // meta info sajta (tema se koristi u rendereru)
  const [post, setPost] = useState(null); // jedan objavljeni post
  const [error, setError] = useState(''); // poruka greške

  useEffect(() => {
    (async () => {
      try {
        // Dohvati sajt (public)
        const { site } = await apiGet(`/api/public/${siteSlug}`);
        setSite(site);
        // Dohvati post po slugu (samo published)
        const { post } = await apiGet(
          `/api/public/${siteSlug}/post/${encodeURIComponent(slug)}`
        );
        setPost(post);
      } catch (e) {
        setError(e?.message || 'Failed to load');
      }
    })();
  }, [siteSlug, slug]);

  // Ekran greške
  if (error) {
    return (
      <div className='max-w-3xl mx-auto px-4 py-6'>
        <div className='flex items-center justify-between'>
          <Link
            to={`/pub/${siteSlug}/blog`}
            className='px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow'
          >
            ← Back
          </Link>
          <h1 className='text-xl font-semibold'>Post</h1>
          <div />
        </div>
        <div className='mt-4 text-red-600'>{error}</div>
      </div>
    );
  }

  // Loading placeholder
  if (!site || !post) {
    return (
      <div className='max-w-3xl mx-auto px-4 py-6'>
        <div className='flex items-center justify-between'>
          <Link
            to={`/pub/${siteSlug}/blog`}
            className='px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow'
          >
            ← Back
          </Link>
          <h1 className='text-xl font-semibold'>Post</h1>
          <div />
        </div>
        <div className='mt-4 text-gray-500'>Loading…</div>
      </div>
    );
  }

  // Prikaz pojedinačnog posta
  return (
    <article className='max-w-3xl mx-auto px-4 py-6'>
      <div className='flex items-center justify-between'>
        <Link
          to={`/pub/${siteSlug}/blog`}
          className='px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow'
        >
          ← Back
        </Link>
        <div className='text-sm text-gray-500'>
          {post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString()
            : ''}
        </div>
      </div>

      {/* Naslov, cover i excerpt */}
      <h1 className='text-3xl font-bold mt-4'>{post.title}</h1>
      {post.coverImageUrl && (
        <img
          src={post.coverImageUrl}
          alt=''
          className='w-full h-auto rounded-xl mt-4 object-cover'
        />
      )}
      {post.excerpt && <p className='text-gray-600 mt-3'>{post.excerpt}</p>}

      {/* Telo posta renderovano kroz blokove */}
      <div className='mt-6'>
        <PublicRenderer blocks={post.blocks} theme={site.theme || {}} />
      </div>
    </article>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { apiGet, apiPost, apiDelete } from '../../lib/api';
import { useLoading } from '../../contexts/LoadingContext';

export default function SitePosts() {
  const { id } = useParams(); // siteId iz rute
  const { withLoading } = useLoading();

  const [site, setSite] = useState(null); // metapodaci sajta (ime itd.)
  const [items, setItems] = useState([]); // lista postova za ovaj sajt

  // polja za formu "Create new post"
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');

  // učitaj sajt
  const fetchSite = async () => {
    const { site } = await withLoading(() => apiGet(`/api/sites/${id}`));
    setSite(site);
  };

  // učitaj postove za sajt
  const fetchPosts = async () => {
    const { items } = await withLoading(() => apiGet(`/api/posts/site/${id}`));
    setItems(items);
  };

  useEffect(() => {
    // inicijalni fetch
    fetchSite().catch(() => {});
    fetchPosts().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // kreiraj novi post (draft)
  const create = async (e) => {
    e.preventDefault();
    const { post } = await withLoading(() =>
      apiPost(`/api/posts/site/${id}`, {
        title,
        slug,
        excerpt,
        status: 'draft',
      })
    );
    // resetuj formu
    setTitle('');
    setSlug('');
    setExcerpt('');
    // osveži listu
    await fetchPosts();
  };

  // publish/unpublish postojećeg posta
  const togglePublish = async (postId, published) => {
    await withLoading(() =>
      apiPost(`/api/posts/${postId}/publish`, { published })
    );
    await fetchPosts();
  };

  // brisanje posta
  const remove = async (postId) => {
    await withLoading(() => apiDelete(`/api/posts/${postId}`));
    await fetchPosts();
  };

  return (
    <>
      {/* Header sa imenom sajta i back linkom */}
      <Card>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-xl font-semibold'>
              {site ? site.name : 'Posts'}
            </h1>
            <p className='text-sm text-gray-500'>
              Create and manage posts for this site.
            </p>
          </div>
          <Link
            to='/me'
            className='px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow'
          >
            ← Back
          </Link>
        </div>
      </Card>

      {/* Forma za pravljenje novog posta */}
      <Card className='mt-6'>
        <h3 className='text-lg font-semibold'>Create new post</h3>
        <form onSubmit={create} className='mt-4 grid md:grid-cols-3 gap-3'>
          <Input
            placeholder='Title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            placeholder='slug (unique)'
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
          <Input
            placeholder='Short excerpt'
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
          <div className='md:col-span-3'>
            <Button type='submit'>Create</Button>
          </div>
        </form>
      </Card>

      {/* Lista postojećih postova sa akcijama */}
      <Card className='mt-6'>
        <h3 className='text-lg font-semibold'>Posts</h3>
        {!items.length ? (
          <div className='text-gray-600 mt-2'>No posts yet.</div>
        ) : (
          <div className='mt-4 space-y-2'>
            {items.map((p) => (
              <div
                key={p._id}
                className='flex items-center justify-between bg-white rounded-lg border border-gray-100 shadow-sm p-3'
              >
                <div>
                  <div className='font-medium'>{p.title}</div>
                  <div className='text-sm text-gray-500'>
                    {p.slug} • {p.status}
                    {p.publishedAt
                      ? ` • ${new Date(p.publishedAt).toLocaleString()}`
                      : ''}
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  {/* otvori editor za post */}
                  <Link
                    to={`/me/posts/${p._id}`}
                    className='px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow'
                  >
                    Open editor
                  </Link>

                  {/* publish/unpublish */}
                  {p.status === 'published' ? (
                    <button
                      onClick={() => togglePublish(p._id, false)}
                      className='px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200'
                    >
                      Unpublish
                    </button>
                  ) : (
                    <button
                      onClick={() => togglePublish(p._id, true)}
                      className='px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700'
                    >
                      Publish
                    </button>
                  )}

                  {/* brisanje uz potvrdu */}
                  <ConfirmDialog
                    triggerLabel='Delete'
                    title='Delete post?'
                    body='This action cannot be undone.'
                    onConfirm={() => remove(p._id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

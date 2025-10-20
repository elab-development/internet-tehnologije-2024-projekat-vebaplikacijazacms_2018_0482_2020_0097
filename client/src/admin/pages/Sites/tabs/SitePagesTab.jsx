import { useEffect, useState, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog';
import { apiDelete, apiGet, apiPost } from '../../../../lib/api';
import { useLoading } from '../../../../contexts/LoadingContext';
import { useAuth } from '../../../../contexts/AuthContext';

export default function SitePagesTab() {
  const { site, setSite } = useOutletContext(); // {site,setSite}
  const { user } = useAuth();
  const [items, setItems] = useState([]); // lista strana
  const [title, setTitle] = useState(''); // forma: naziv strane
  const [path, setPath] = useState(''); // forma: path
  const [creating, setCreating] = useState(false); // stanje dugmeta za blog
  const { withLoading } = useLoading();

  // dozvole: owner ili admin
  const isOwner = useMemo(() => {
    if (!site?.owners) return false;
    if (user?.role === 'admin') return true;
    return site.owners.some((id) => String(id) === String(user?.id));
  }, [site?.owners, user]);

  // učitaj sve strane sajta
  const fetchPages = async () => {
    const { items } = await withLoading(() =>
      apiGet(`/api/sites/${site._id}/pages`)
    );
    setItems(items);
  };

  // osveži site objekat iz backend-a (npr. nakon setHomepage)
  const refreshSite = async () => {
    const { site: updated } = await withLoading(() =>
      apiGet(`/api/sites/${site._id}`)
    );
    setSite?.(updated);
  };

  useEffect(() => {
    fetchPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site._id]);

  // kreiranje nove strane
  const create = async (e) => {
    e.preventDefault();
    if (!isOwner) return;
    await withLoading(() =>
      apiPost(`/api/pages/site/${site._id}`, {
        title,
        path: path || '/new-page',
        blocks: [],
        isDraft: true,
      })
    );
    setTitle('');
    setPath('');
    await fetchPages();
  };

  // dupliranje postojeće strane
  const duplicate = async (pageId) => {
    if (!isOwner) return;
    await withLoading(() => apiPost(`/api/pages/${pageId}/duplicate`, {}));
    await fetchPages();
  };

  // brisanje strane
  const remove = async (pageId) => {
    if (!isOwner) return;
    await withLoading(() => apiDelete(`/api/pages/${pageId}`));
    await fetchPages();
  };

  // postavljanje homepage-a
  const setHomepage = async (pageId) => {
    if (!isOwner) return;
    await withLoading(() =>
      apiPost(`/api/pages/site/${site._id}/homepage`, { pageId })
    );
    await Promise.all([fetchPages(), refreshSite()]);
  };

  // automatsko kreiranje /blog strane (lista postova)
  async function createBlog() {
    try {
      setCreating(true);
      await withLoading(() => apiPost(`/api/sites/${site._id}/autoblog`));
      alert('Blog page ready at /blog');
      await fetchPages();
    } catch (e) {
      alert(e?.message || 'Failed');
    } finally {
      setCreating(false);
    }
  }

  // helper za preview link pojedinačne strane
  const previewPageHref = (p) =>
    `/preview/${site._id}/page?path=${encodeURIComponent(p.path || '/')}`;

  return (
    <>
      {/* forma za kreiranje nove strane + brzi linkovi za blog */}
      <Card className='mt-6'>
        <h3 className='text-lg font-semibold'>Create new page</h3>
        <form onSubmit={create} className='mt-4 grid md:grid-cols-3 gap-3'>
          <Input
            placeholder='Title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={!isOwner}
          />
          <Input
            placeholder='/about'
            value={path}
            onChange={(e) => setPath(e.target.value)}
            disabled={!isOwner}
          />
          <Button
            type='submit'
            disabled={!isOwner}
            className={!isOwner ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Create
          </Button>
        </form>

        {/* quick actions: kreiraj /blog i otvori preview /blog-a */}
        <div className='mt-4 flex items-center gap-2'>
          <button
            onClick={createBlog}
            disabled={!isOwner || creating}
            className={`px-3 py-2 rounded-lg shadow ${
              !isOwner
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
            title='Create a /blog page that lists published posts'
          >
            {creating ? 'Creating…' : 'Create Blog Page'}
          </button>
          <Link
            to={`/preview/${site._id}/page?path=${encodeURIComponent('/blog')}`}
            className='px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow'
            title='Preview /blog page'
            target='_blank'
            rel='noreferrer'
          >
            Preview Blog Page
          </Link>
        </div>

        {!isOwner && (
          <p className='mt-2 text-sm text-gray-500'>
            Only owners (or admins) can create pages.
          </p>
        )}
      </Card>

      {/* tabela/lista postojećih strana */}
      <Card className='mt-6'>
        <h3 className='text-lg font-semibold'>Pages</h3>
        {!items.length ? (
          <div className='text-gray-600 mt-2'>No pages yet.</div>
        ) : (
          <div className='mt-4 space-y-2'>
            {items.map((p) => {
              const isHome = String(site.homepage) === String(p._id);
              return (
                <div
                  key={p._id}
                  className='flex items-center justify-between bg-white rounded-lg border border-gray-100 shadow-sm p-3'
                >
                  <div>
                    <div className='font-medium'>{p.title}</div>
                    <div className='text-sm text-gray-500'>
                      {p.path}
                      {isHome ? ' • homepage' : ''}
                      {p.isDraft ? ' • draft' : ''}
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {/* preview link */}
                    <Link
                      to={previewPageHref(p)}
                      className='px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200'
                      target='_blank'
                      rel='noreferrer'
                      title='Preview page'
                    >
                      Preview
                    </Link>

                    {isOwner ? (
                      <>
                        <Link
                          to={`/pages/${p._id}`}
                          className='px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow'
                        >
                          Open editor
                        </Link>
                        <button
                          onClick={() => duplicate(p._id)}
                          className='px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200'
                        >
                          Duplicate
                        </button>
                        <button
                          onClick={() => setHomepage(p._id)}
                          className='px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100'
                        >
                          Set homepage
                        </button>
                        <ConfirmDialog
                          triggerLabel='Delete'
                          title='Delete page?'
                          body='This action cannot be undone.'
                          onConfirm={() => remove(p._id)}
                        />
                      </>
                    ) : (
                      <span className='px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500'>
                        Owner only
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}

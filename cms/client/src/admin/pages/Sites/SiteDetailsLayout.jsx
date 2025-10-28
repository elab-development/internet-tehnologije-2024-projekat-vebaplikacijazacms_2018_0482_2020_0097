import { useEffect, useState, useMemo } from 'react';
import {
  useParams,
  NavLink,
  Outlet,
  Link,
  useNavigate,
} from 'react-router-dom';
import { apiGet, apiPost, apiDelete } from '../../../lib/api';
import Card from '../../../components/ui/Card';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { useLoading } from '../../../contexts/LoadingContext';
import { useAuth } from '../../../contexts/AuthContext';

export default function SiteDetailsLayout() {
  const { id } = useParams(); // siteId
  const nav = useNavigate();
  const { withLoading } = useLoading();
  const { user } = useAuth();

  const [site, setSite] = useState(null); // objekat sajta
  const [err, setErr] = useState(''); // prikaz greške

  // da li je trenutni korisnik owner ili admin
  const isOwnerOrAdmin = useMemo(() => {
    if (!site) return false;
    if (user?.role === 'admin') return true;
    return site.owners?.some((oid) => String(oid) === String(user?.id));
  }, [site, user]);

  // učitaj site detalje
  useEffect(() => {
    (async () => {
      try {
        const { site } = await withLoading(() => apiGet(`/api/sites/${id}`));
        setSite(site);
        setErr('');
      } catch (e) {
        setErr(e?.message || 'Failed to load site');
      }
    })();
  }, [id]);

  // vrednost za Outlet context (deljenje site/setSite deci)
  const ctx = useMemo(() => ({ site, setSite }), [site]);

  if (err) {
    // fallback sa greškom
    return (
      <Card>
        <div className='flex items-center justify-between'>
          <button
            onClick={() => nav('/sites')}
            className='px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow'
          >
            ← Back
          </button>
          <h1 className='text-xl font-semibold'>Site</h1>
          <div />
        </div>
        <p className='mt-3 text-red-600'>{err}</p>
      </Card>
    );
  }

  if (!site) return null;

  const base = `/sites/${site._id}`; // baza za tab linkove

  // badge za status publikacije
  const statusBadge = site.isPublished ? (
    <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200'>
      Published
    </span>
  ) : (
    <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200'>
      Draft
    </span>
  );

  // toggle publish/unpublish
  const togglePublish = async () => {
    try {
      const { site: updated } = await withLoading(() =>
        apiPost(`/api/sites/${site._id}/publish`, {
          published: !site.isPublished,
        })
      );
      setSite(updated);
    } catch (e) {
      alert(e?.message || 'Failed to change publish status');
    }
  };

  // brisanje sajta
  const deleteSite = async () => {
    try {
      await withLoading(() => apiDelete(`/api/sites/${site._id}`));
      nav('/sites');
    } catch (e) {
      alert(e?.message || 'Failed to delete site');
    }
  };

  // kopiranje domena ili preview URL-a u clipboard
  const copyDomain = async () => {
    try {
      const text =
        site.customDomain?.trim() ||
        `${window.location.origin}/preview/${site._id}`;
      await navigator.clipboard.writeText(text);
      alert('Copied!');
    } catch {
      // ignore
    }
  };

  return (
    <>
      {/* zaglavlje sa meta informacijama i quick akcijama */}
      <Card>
        <div className='flex items-center justify-between'>
          {/* leva strana: naziv, status, meta */}
          <div className='flex items-start gap-3'>
            <button
              onClick={() => nav('/sites')}
              className='px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow'
              title='Back to Sites'
            >
              ← Back
            </button>
            <div>
              <div className='flex items-center gap-3'>
                <h1 className='text-xl font-semibold'>{site.name}</h1>
                {statusBadge}
              </div>
              <div className='text-sm text-gray-500 mt-1'>
                Template: <span className='font-medium'>{site.template}</span>
                {' • '}
                Site ID:{' '}
                <span className='font-mono'>
                  {String(site._id).slice(0, 8)}…
                </span>
              </div>
              <div className='mt-1 text-sm text-gray-600 flex items-center gap-2'>
                Domain:{' '}
                <span className='font-medium'>
                  {site.customDomain?.trim() || 'not set'}
                </span>
                <button
                  onClick={copyDomain}
                  className='px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200'
                  title='Copy'
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* desna strana: akcije */}
          <div className='flex items-center gap-2'>
            <Link
              className='px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-black shadow'
              to={`/preview/${site._id}`}
              target='_blank'
              rel='noreferrer'
              title='Open Preview'
            >
              Preview
            </Link>

            {!!site.homepage && (
              <Link
                className='px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow'
                to={`/pages/${site.homepage}`}
                title='Open homepage in editor'
              >
                Open homepage
              </Link>
            )}

            {isOwnerOrAdmin ? (
              <>
                <button
                  onClick={togglePublish}
                  className={`px-3 py-2 rounded-lg shadow ${
                    site.isPublished
                      ? 'bg-gray-100 hover:bg-gray-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                  title={site.isPublished ? 'Unpublish site' : 'Publish site'}
                >
                  {site.isPublished ? 'Unpublish' : 'Publish'}
                </button>

                <ConfirmDialog
                  triggerLabel='Delete'
                  title='Delete site?'
                  body='This will permanently delete the site and all its pages & posts.'
                  onConfirm={deleteSite}
                  /* triggerClassName se prosleđuje kao prop ako ga komponenta podržava */
                />
              </>
            ) : null}
          </div>
        </div>

        {/* tab navigacija */}
        <div className='mt-6 flex gap-3 border-b'>
          <NavLink
            to={base}
            end
            className={({ isActive }) =>
              `px-3 py-2 -mb-px border-b-2 ${
                isActive
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`
            }
          >
            Overview
          </NavLink>
          <NavLink
            to={`${base}/pages`}
            className={({ isActive }) =>
              `px-3 py-2 -mb-px border-b-2 ${
                isActive
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`
            }
          >
            Pages
          </NavLink>
          <NavLink
            to={`${base}/editors`}
            className={({ isActive }) =>
              `px-3 py-2 -mb-px border-b-2 ${
                isActive
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`
            }
          >
            Editors
          </NavLink>
          <NavLink
            to={`${base}/theme`}
            className={({ isActive }) =>
              `px-3 py-2 -mb-px border-b-2 ${
                isActive
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`
            }
          >
            Theme
          </NavLink>
          <NavLink
            to={`${base}/publish`}
            className={({ isActive }) =>
              `px-3 py-2 -mb-px border-b-2 ${
                isActive
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`
            }
          >
            Publish
          </NavLink>
        </div>
      </Card>

      {/* deca rute dobijaju {site,setSite} kroz Outlet context */}
      <Outlet context={ctx} />
    </>
  );
}

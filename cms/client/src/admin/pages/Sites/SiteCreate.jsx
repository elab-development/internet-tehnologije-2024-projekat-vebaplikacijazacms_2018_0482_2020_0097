import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiGet } from '../../../lib/api';
import PublicRenderer from '../../../public/PublicRenderer';

export default function PreviewSite() {
  const { id } = useParams(); // siteId iz URL-a
  const [site, setSite] = useState(null); // meta info sajta
  const [home, setHome] = useState(null); // homepage Page dokument
  const [error, setError] = useState(''); // poruka greške

  useEffect(() => {
    (async () => {
      try {
        // učitaj site (authed endpoint)
        const { site } = await apiGet(`/api/sites/${id}`);
        setSite(site);
        // ako postoji homepage referenca → učitaj je
        if (site?.homepage) {
          const { page } = await apiGet(`/api/pages/${site.homepage}`);
          setHome(page);
        }
      } catch (e) {
        setError(e?.message || 'Failed to load preview');
      }
    })();
  }, [id]);

  if (error) {
    // fallback sa greškom i back linkom
    return (
      <div className='max-w-5xl mx-auto px-4 py-6'>
        <div className='flex items-center justify-between'>
          <Link
            to={`/sites/${id}/pages`}
            className='px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow'
          >
            ← Back
          </Link>
          <h1 className='text-xl font-semibold'>Preview</h1>
          <div />
        </div>
        <p className='mt-3 text-red-600'>{error}</p>
      </div>
    );
  }

  if (!site || !home) {
    // loading stanje
    return (
      <div className='max-w-5xl mx-auto px-4 py-6'>
        <div className='flex items-center justify-between'>
          <Link
            to={`/sites/${id}/pages`}
            className='px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow'
          >
            ← Back
          </Link>
          <h1 className='text-xl font-semibold'>Preview</h1>
          <div />
        </div>
        <div className='mt-6 text-gray-500'>Loading...</div>
      </div>
    );
  }

  // primena teme sajta u preview-u
  const theme = site.theme || {};
  const font = theme.font || 'Inter, system-ui, sans-serif';
  const primary = theme.primary || '#111827';

  return (
    <div style={{ fontFamily: font }}>
      {/* top bar samo u preview-u */}
      <div className='sticky top-0 z-10 bg-white/90 backdrop-blur border-b'>
        <div className='max-w-5xl mx-auto px-4 py-3 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Link
              to={`/sites/${id}/pages`}
              className='px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow'
            >
              ← Back
            </Link>
            <div>
              <div className='text-sm text-gray-500'>Previewing</div>
              <div className='font-semibold'>{site.name}</div>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <span
              className='inline-block w-5 h-5 rounded'
              style={{ background: primary }}
            />
            <span className='text-sm text-gray-600'>
              {theme.font || 'Inter'}
            </span>
          </div>
        </div>
      </div>

      {/* sadržaj homepage-a */}
      <main className='max-w-5xl mx-auto px-4 py-6'>
        <PublicRenderer blocks={home.blocks} theme={theme} />
      </main>

      {/* footer za preview */}
      <footer className='border-t'>
        <div className='max-w-5xl mx-auto px-4 py-6 text-sm text-gray-500'>
          © {new Date().getFullYear()} {site.name}. Preview mode.
        </div>
      </footer>
    </div>
  );
}

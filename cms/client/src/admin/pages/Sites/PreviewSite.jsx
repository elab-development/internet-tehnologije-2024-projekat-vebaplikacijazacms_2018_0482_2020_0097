// src/admin/pages/Sites/PreviewPage.jsx
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { apiGet } from '../../../lib/api';
import PublicRenderer from '../../../public/PublicRenderer';

export default function PreviewPage() {
  const { id } = useParams(); // siteId iz URL-a
  const [sp] = useSearchParams(); // query string (?path=/nesto)
  const targetPath = sp.get('path') || '/blog'; // default path

  const [site, setSite] = useState(null); // meta info sajta (authed endpoint)
  const [page, setPage] = useState(null); // konkretna stranica po path-u
  const [error, setError] = useState(''); // poruka greške

  useEffect(() => {
    (async () => {
      try {
        // 1) sajt (autentifikovani endpoint)
        const { site } = await apiGet(`/api/sites/${id}`);
        setSite(site);

        // 2) lista svih strana → pronalazak po path-u
        const { items } = await apiGet(`/api/sites/${id}/pages`);
        const found = (items || []).find((p) => p.path === targetPath);
        if (!found) throw new Error('Page not found');

        // 3) učitaj kompletnu stranicu
        const { page } = await apiGet(`/api/pages/${found._id}`);
        setPage(page);
      } catch (e) {
        setError(e?.message || 'Failed to load page');
      }
    })();
  }, [id, targetPath]);

  if (error) {
    // header sa back linkom + prikaz greške
    return (
      <div className='max-w-5xl mx-auto px-4 py-6'>
        <div className='flex items-center justify-between'>
          <Link
            to={`/sites/${id}/pages`}
            className='px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow'
          >
            ← Back
          </Link>
          <h1 className='text-xl font-semibold'>Preview page</h1>
          <div />
        </div>
        <div className='mt-4 text-red-600'>{error}</div>
      </div>
    );
  }

  if (!site || !page) {
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
          <h1 className='text-xl font-semibold'>Preview page</h1>
          <div />
        </div>
        <div className='mt-4 text-gray-500'>Loading…</div>
      </div>
    );
  }

  // render javne komponente sa blokovima (preview mod)
  return (
    <div>
      {/* gornja traka sa povratkom */}
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
              <div className='font-semibold'>
                {site.name} — {page.title} ({page.path})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* sadržaj stranice renderovan kroz PublicRenderer */}
      <main className='max-w-5xl mx-auto px-4 py-6'>
        <PublicRenderer
          blocks={page.blocks}
          theme={site.theme || {}}
          site={site}
          preview
        />
      </main>
    </div>
  );
}

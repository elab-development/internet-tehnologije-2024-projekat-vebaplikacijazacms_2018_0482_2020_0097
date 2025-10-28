import { useEffect, useState } from 'react';
import { apiGet } from '../lib/api';

export default function PublicRenderer({ blocks, theme, site, preview }) {
  // Ako nema blokova, prikaži info
  if (!Array.isArray(blocks) || !blocks.length) {
    return <div className='text-gray-500 text-sm'>No content.</div>;
  }
  // Kontekst koji prosleđujemo nižim čvorovima (tema, identitet sajta, preview režim)
  const ctx = {
    theme: theme || {},
    siteId: site?._id,
    siteSlug: site?.slug,
    preview: !!preview,
  };
  return (
    <div>
      {/* Render svakog korenskog bloka */}
      {blocks.map((n) => (
        <Node key={n.id} node={n} ctx={ctx} />
      ))}
    </div>
  );
}

// Render jednog čvora po tipu
function Node({ node, ctx }) {
  switch (node.type) {
    case 'section': {
      // Sekcija sa pozadinom i paddingom; renderuje decu
      const { bg = '#ffffff', pad = 16 } = node.props || {};
      return (
        <section style={{ background: bg }} className='py-2'>
          <div className='max-w-5xl mx-auto' style={{ padding: pad }}>
            {node.children?.map((c) => (
              <Node key={c.id} node={c} ctx={ctx} />
            ))}
          </div>
        </section>
      );
    }
    case 'row': {
      // CSS grid red; broj kolona/gap iz props
      const { cols = 2, gap = 16 } = node.props || {};
      const gridCols = Math.max(1, Math.min(4, Number(cols)));
      return (
        <div
          className='grid'
          style={{
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            gap,
          }}
        >
          {node.children?.map((c) => (
            <Node key={c.id} node={c} ctx={ctx} />
          ))}
        </div>
      );
    }
    case 'col':
      // Kolona samo prosleđuje render dece
      return (
        <div>
          {node.children?.map((c) => (
            <Node key={c.id} node={c} ctx={ctx} />
          ))}
        </div>
      );

    case 'text': {
      // Tekstualni blok; Tag i klase izvedene iz 'as'
      const { as = 'p', value = '' } = node.props || {};
      const Tag = ['h1', 'h2', 'h3', 'p'].includes(as) ? as : 'p';
      const cls =
        as === 'h1'
          ? 'text-4xl font-bold'
          : as === 'h2'
          ? 'text-3xl font-semibold'
          : as === 'h3'
          ? 'text-2xl font-semibold'
          : 'text-base';
      return <Tag className={`${cls} my-2`}>{value}</Tag>;
    }

    case 'image': {
      // Slika sa lazy loading-om; placeholder ako nema src
      const { src, alt = '' } = node.props || {};
      if (!src)
        return <div className='aspect-[16/9] bg-gray-100 rounded-md my-2' />;
      return (
        <img
          src={src}
          alt={alt}
          className='w-full h-auto rounded-md my-2 object-cover'
          loading='lazy'
        />
      );
    }

    case 'button': {
      // Link dugme; boja iz teme (accent)
      const { label = 'Click', href = '#' } = node.props || {};
      const accent = ctx.theme?.accent || '#2563eb';
      return (
        <a
          href={href}
          className='inline-block px-4 py-2 rounded-lg text-white my-2'
          style={{ background: accent }}
          target='_blank'
          rel='noreferrer'
        >
          {label}
        </a>
      );
    }

    case 'hero': {
      // Hero sa background slikom i overlay-om
      const { title = 'Welcome', subtitle = '', imageUrl } = node.props || {};
      const overlay = 'bg-black/40';
      return (
        <header
          className='rounded-xl overflow-hidden my-3'
          style={{
            backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className={`${overlay} text-white`}>
            <div className='max-w-5xl mx-auto p-10'>
              <h1 className='text-4xl font-semibold'>{title}</h1>
              {subtitle && (
                <p className='mt-3 text-white/90 text-lg'>{subtitle}</p>
              )}
            </div>
          </div>
        </header>
      );
    }

    case 'postsList':
      // Dinamički blok koji dohvaća objavljene postove
      return <PostsListClient node={node} ctx={ctx} />;

    default:
      // Fallback za nepoznate tipove
      return <div className='text-sm text-gray-500 my-2'>Unknown block</div>;
  }
}

// Klijent komponenta za listu postova (public ili preview režim)
function PostsListClient({ node, ctx }) {
  const {
    layout = 'grid', // 'grid' ili 'list'
    limit = 12, // maksimalan broj po strani
    showExcerpt = true, // prikaz excerpt-a
    showDate = true, // prikaz datuma
  } = node.props || {};
  const [items, setItems] = useState([]); // dohvaćeni postovi
  const [cursor, setCursor] = useState(null); // pagination cursor
  const [err, setErr] = useState(''); // greška za prikaz

  useEffect(() => {
    (async () => {
      try {
        setErr('');

        if (ctx.preview && ctx.siteId) {
          // U preview-u dohvat preko authed endpoint-a po siteId, filtrirano na 'published'
          const qs = new URLSearchParams();
          qs.set('limit', String(limit));
          qs.set('status', 'published');
          const { items, nextCursor } = await apiGet(
            `/api/posts/site/${ctx.siteId}?${qs.toString()}`
          );
          setItems(items || []);
          setCursor(nextCursor || null);
          return;
        }

        // U public modu dohvat po slug-u sajta
        if (ctx.siteSlug) {
          const { items, nextCursor } = await apiGet(
            `/api/public/${ctx.siteSlug}/posts?limit=${limit}`
          );
          setItems(items || []);
          setCursor(nextCursor || null);
          return;
        }

        // Ako nema ni preview ni slug, nema rezultata
        setItems([]);
      } catch (e) {
        setErr(e?.message || 'Failed to load posts');
        setItems([]);
      }
    })();
  }, [ctx.preview, ctx.siteId, ctx.siteSlug, limit]);

  // URL ka pojedinačnom postu (različit za preview/public)
  const hrefFor = (slug) =>
    ctx.preview && ctx.siteId
      ? `/preview/${ctx.siteId}/page?path=${encodeURIComponent('/blog')}`
      : ctx.siteSlug
      ? `/pub/${ctx.siteSlug}/blog/${slug}`
      : '#';

  // Stanja prikaza
  if (err) return <div className='text-sm text-red-600'>{err}</div>;
  if (!items.length)
    return <div className='text-gray-500 text-sm my-2'>No posts yet.</div>;

  // List prikaz
  if (layout === 'list') {
    return (
      <div className='divide-y divide-gray-200 rounded-lg border border-gray-100 bg-white shadow'>
        {items.map((p) => (
          <a
            key={p._id}
            href={hrefFor(p.slug)}
            className='block px-4 py-3 hover:bg-gray-50'
          >
            <div className='font-medium'>{p.title}</div>
            {showExcerpt && (
              <div className='text-sm text-gray-600'>{p.excerpt}</div>
            )}
            {showDate && (
              <div className='text-xs text-gray-400 mt-1'>
                {p.publishedAt
                  ? new Date(p.publishedAt).toLocaleDateString()
                  : ''}
              </div>
            )}
          </a>
        ))}
      </div>
    );
  }

  // Grid prikaz (default)
  return (
    <div className='grid md:grid-cols-2 gap-4'>
      {items.map((p) => (
        <a
          key={p._id}
          href={hrefFor(p.slug)}
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
            {showExcerpt && (
              <div className='text-sm text-gray-500 mt-1'>{p.excerpt}</div>
            )}
            {showDate && (
              <div className='text-xs text-gray-400 mt-2'>
                {p.publishedAt
                  ? new Date(p.publishedAt).toLocaleDateString()
                  : ''}
              </div>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}

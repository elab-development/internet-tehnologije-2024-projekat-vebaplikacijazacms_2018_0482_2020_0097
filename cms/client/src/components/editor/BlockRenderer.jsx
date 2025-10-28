import { canHaveChildren } from './utils';

export default function BlockRenderer({
  node, // trenutni blok (čvor)
  onSelect, // set selekcije
  selected, // ID selektovanog
  onDragStart, // handler za drag postojećeg bloka
}) {
  const isSelected = selected === node.id;

  // omotač svakog rendera (border, selekcija, drag start)
  const wrap = (child) => (
    <div
      className={`relative group rounded-lg border ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        onDragStart?.(e, node.id);
      }}
      style={{ cursor: 'grab' }}
    >
      {child}
    </div>
  );

  // render po tipu
  switch (node.type) {
    case 'section': {
      const { bg, pad } = node.props || {};
      return wrap(
        <div style={{ background: bg }} className='p-3'>
          <div className='rounded-md' style={{ padding: (pad ?? 16) + 'px' }}>
            {canHaveChildren(node) && node.children?.length ? (
              <div className='space-y-3'>
                {node.children.map((c) => (
                  <div key={c.id} />
                ))}
              </div>
            ) : (
              <div className='text-gray-400 text-sm'>Empty section</div>
            )}
          </div>
        </div>
      );
    }

    case 'row': {
      const { cols = 2, gap = 16 } = node.props || {};
      const gridCols = Math.max(1, Math.min(4, Number(cols)));
      return wrap(
        <div
          className='p-3'
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            gap,
          }}
        >
          {canHaveChildren(node) && node.children?.length ? (
            node.children.map((c) => <div key={c.id} />)
          ) : (
            <div className='text-gray-400 text-sm col-span-full'>Empty row</div>
          )}
        </div>
      );
    }

    case 'col':
      return wrap(
        <div className='p-3'>
          {canHaveChildren(node) && node.children?.length ? (
            <div className='space-y-3'>
              {node.children.map((c) => (
                <div key={c.id} />
              ))}
            </div>
          ) : (
            <div className='text-gray-400 text-sm'>Empty column</div>
          )}
        </div>
      );

    case 'text': {
      const { as = 'p', value = '' } = node.props || {};
      const Tag = ['h1', 'h2', 'h3', 'p'].includes(as) ? as : 'p';
      const cls =
        as === 'h1'
          ? 'text-3xl font-bold'
          : as === 'h2'
          ? 'text-2xl font-semibold'
          : as === 'h3'
          ? 'text-xl font-semibold'
          : 'text-base';
      return wrap(
        <div className='p-4'>
          <Tag className={cls}>{value || ' '}</Tag>
        </div>
      );
    }

    case 'image': {
      const { src, alt } = node.props || {};
      return wrap(
        <div className='p-3'>
          {src ? (
            <img
              src={src}
              alt={alt || ''}
              className='w-full h-auto rounded-md object-cover'
            />
          ) : (
            <div className='aspect-[16/9] bg-gray-100 rounded-md' />
          )}
        </div>
      );
    }

    case 'button': {
      const { label = 'Click', href = '#' } = node.props || {};
      return wrap(
        <div className='p-4'>
          <a
            href={href}
            onClick={(e) => e.preventDefault()} // u editoru blok ne navigira
            className='inline-block px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow'
          >
            {label}
          </a>
        </div>
      );
    }

    case 'hero': {
      const { title = 'Welcome', subtitle = '', imageUrl } = node.props || {};
      return wrap(
        <div
          className='rounded-lg overflow-hidden'
          style={{
            backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className='bg-black/40 text-white p-10'>
            <h1 className='text-3xl font-semibold'>{title}</h1>
            {subtitle && <p className='mt-2 text-white/90'>{subtitle}</p>}
          </div>
        </div>
      );
    }

    default:
      return wrap(<div className='p-3 text-sm'>Unknown block</div>);
  }
}

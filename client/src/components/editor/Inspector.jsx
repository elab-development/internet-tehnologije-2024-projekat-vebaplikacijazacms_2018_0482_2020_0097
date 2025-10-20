import Input from '../ui/Input';
import FileUpload from '../upload/FileUpload';

export default function Inspector({ node, onChange }) {
  // ako nema selekcije, prikaži hint
  if (!node) {
    return (
      <div className='bg-white rounded-xl shadow p-4 text-gray-500'>
        Select a block to edit properties.
      </div>
    );
  }

  // helper za setovanje pojedinačnog props-a
  const set = (key, val) => onChange({ ...node.props, [key]: val });
  // helper za label stil
  const L = ({ children }) => (
    <label className='block text-sm text-gray-700 mt-3'>{children}</label>
  );

  // različiti paneli po tipu bloka
  switch (node.type) {
    case 'section':
      return (
        <div className='bg-white rounded-xl shadow p-4'>
          <h4 className='font-semibold'>Section</h4>
          <L>Background</L>
          <Input
            type='color'
            value={node.props.bg || '#ffffff'}
            onChange={(e) => set('bg', e.target.value)}
          />
          <L>Padding (px)</L>
          <Input
            type='number'
            value={node.props.pad ?? 16}
            onChange={(e) => set('pad', Number(e.target.value || 0))}
          />
        </div>
      );
    case 'row':
      return (
        <div className='bg-white rounded-xl shadow p-4'>
          <h4 className='font-semibold'>Row</h4>
          <L>Columns (1-4)</L>
          <Input
            type='number'
            min={1}
            max={4}
            value={node.props.cols ?? 2}
            onChange={(e) => set('cols', Number(e.target.value || 1))}
          />
          <L>Gap (px)</L>
          <Input
            type='number'
            value={node.props.gap ?? 16}
            onChange={(e) => set('gap', Number(e.target.value || 0))}
          />
        </div>
      );
    case 'col':
      return (
        <div className='bg-white rounded-xl shadow p-4'>
          <h4 className='font-semibold'>Column</h4>
          <p className='text-sm text-gray-500'>No properties.</p>
        </div>
      );
    case 'text':
      return (
        <div className='bg-white rounded-xl shadow p-4'>
          <h4 className='font-semibold'>Text</h4>
          <L>Tag</L>
          <select
            className='w-full rounded-lg border border-gray-200 px-3 py-2'
            value={node.props.as || 'p'}
            onChange={(e) => set('as', e.target.value)}
          >
            <option>h1</option>
            <option>h2</option>
            <option>h3</option>
            <option>p</option>
          </select>
          <L>Content</L>
          <textarea
            className='w-full rounded-lg border border-gray-200 px-3 py-2'
            rows={5}
            value={node.props.value || ''}
            onChange={(e) => set('value', e.target.value)}
          />
        </div>
      );
    case 'image':
      return (
        <div className='bg-white rounded-xl shadow p-4'>
          <h4 className='font-semibold'>Image</h4>
          <L>Source URL</L>
          <Input
            value={node.props.src || ''}
            onChange={(e) => set('src', e.target.value)}
          />
          <div className='mt-2'>
            <FileUpload
              label='Upload image'
              onUploaded={(url) => set('src', url)} // upload → set src
            />
          </div>
          <L>Alt text</L>
          <Input
            value={node.props.alt || ''}
            onChange={(e) => set('alt', e.target.value)}
          />
        </div>
      );
    case 'button':
      return (
        <div className='bg-white rounded-xl shadow p-4'>
          <h4 className='font-semibold'>Button</h4>
          <L>Label</L>
          <Input
            value={node.props.label || ''}
            onChange={(e) => set('label', e.target.value)}
          />
          <L>Href</L>
          <Input
            value={node.props.href || ''}
            onChange={(e) => set('href', e.target.value)}
          />
        </div>
      );
    case 'hero':
      return (
        <div className='bg-white rounded-xl shadow p-4'>
          <h4 className='font-semibold'>Hero</h4>
          <L>Title</L>
          <Input
            value={node.props.title || ''}
            onChange={(e) => set('title', e.target.value)}
          />
          <L>Subtitle</L>
          <Input
            value={node.props.subtitle || ''}
            onChange={(e) => set('subtitle', e.target.value)}
          />
          <L>Background image</L>
          <Input
            value={node.props.imageUrl || ''}
            onChange={(e) => set('imageUrl', e.target.value)}
          />
          <div className='mt-2'>
            <FileUpload
              label='Upload image'
              onUploaded={(url) => set('imageUrl', url)}
            />
          </div>
        </div>
      );
    default:
      return (
        <div className='bg-white rounded-xl shadow p-4'>
          <h4 className='font-semibold'>Unknown block</h4>
        </div>
      );
  }
}

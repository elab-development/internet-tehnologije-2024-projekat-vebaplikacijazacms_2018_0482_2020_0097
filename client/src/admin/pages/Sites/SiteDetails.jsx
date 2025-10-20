import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import FileUpload from '../../../components/upload/FileUpload';
import { useLoading } from '../../../contexts/LoadingContext';

export default function SiteCreate() {
  // forma: ime, template, tema (boje, font, logo)
  const [name, setName] = useState('');
  const [template, setTemplate] = useState('classic');
  const [templates, setTemplates] = useState([]);
  const [theme, setTheme] = useState({
    primary: '#111827',
    accent: '#2563eb',
    font: 'Inter',
    logoUrl: '',
  });

  const { withLoading } = useLoading();
  const nav = useNavigate();

  useEffect(() => {
    // povuci listu dostupnih templejta
    (async () => {
      try {
        const { items } = await withLoading(() => apiGet('/api/templates'));
        setTemplates(items);
        if (items?.length && !items.includes(template)) setTemplate(items[0]);
      } catch {
        setTemplates(['classic', 'magazine']);
      }
    })();
  }, []); // mount

  // submit → kreiraj sajt i preusmeri na detalje
  const create = async (e) => {
    e.preventDefault();
    try {
      const { site } = await withLoading(() =>
        apiPost('/api/sites', { name, template, theme, editors: [] })
      );
      nav(`/sites/${site._id}`, { replace: true });
    } catch (err) {
      alert(err.message || 'Failed to create site');
    }
  };

  return (
    <Card>
      <h1 className='text-xl font-semibold'>Create site</h1>

      <form
        onSubmit={create}
        className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-6'
      >
        {/* leva kolona: ime i template */}
        <div>
          <label className='block text-sm text-gray-700'>Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='My Awesome Site'
            required
          />

          <label className='block text-sm text-gray-700 mt-4'>Template</label>
          <select
            className='w-full rounded-lg border border-gray-200 px-3 py-2'
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          >
            {(templates.length ? templates : ['classic', 'magazine']).map(
              (t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              )
            )}
          </select>

          <div className='mt-6'>
            <Button type='submit'>Create</Button>
          </div>
        </div>

        {/* desna kolona: tema + logo + statički preview */}
        <div>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm text-gray-700'>
                Primary color
              </label>
              <Input
                type='color'
                value={theme.primary}
                onChange={(e) =>
                  setTheme({ ...theme, primary: e.target.value })
                }
              />
            </div>
            <div>
              <label className='block text-sm text-gray-700'>
                Accent color
              </label>
              <Input
                type='color'
                value={theme.accent}
                onChange={(e) => setTheme({ ...theme, accent: e.target.value })}
              />
            </div>
          </div>

          <label className='block text-sm text-gray-700 mt-4'>Font</label>
          <select
            className='w-full rounded-lg border border-gray-200 px-3 py-2'
            value={theme.font}
            onChange={(e) => setTheme({ ...theme, font: e.target.value })}
          >
            <option>Inter</option>
            <option>Roboto</option>
            <option>System UI</option>
          </select>

          <div className='mt-4'>
            <span className='block text-sm text-gray-700 mb-2'>Logo</span>
            <FileUpload
              label={theme.logoUrl ? 'Change logo' : 'Upload logo'}
              onUploaded={(url) => setTheme({ ...theme, logoUrl: url })}
            />
            {theme.logoUrl && (
              <div className='mt-3'>
                <img
                  src={theme.logoUrl}
                  alt='logo'
                  className='h-12 object-contain'
                />
              </div>
            )}
          </div>

          <div className='mt-6 p-4 rounded-xl border border-dashed border-gray-200'>
            <div className='text-sm text-gray-500'>Preview (static)</div>
            <div
              className='mt-2 h-24 rounded-lg'
              style={{ background: theme.primary }}
            />
            <div
              className='mt-2 h-2 w-24 rounded'
              style={{ background: theme.accent }}
            />
            <div className='mt-1 text-sm'>{theme.font}</div>
          </div>
        </div>
      </form>
    </Card>
  );
}

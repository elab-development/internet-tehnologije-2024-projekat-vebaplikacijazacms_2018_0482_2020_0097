import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import FileUpload from '../../../../components/upload/FileUpload';
import { apiPut } from '../../../../lib/api';
import { useLoading } from '../../../../contexts/LoadingContext';

export default function SiteThemeTab() {
  const { site, setSite } = useOutletContext(); // {site,setSite}
  // lokalno stanje teme (boje, font, logo)
  const [theme, setTheme] = useState(
    site.theme || {
      primary: '#111827',
      accent: '#2563eb',
      font: 'Inter',
      logoUrl: '',
    }
  );
  const { withLoading } = useLoading();

  // snimi izmenjenu temu na sajt
  const save = async (e) => {
    e.preventDefault();
    const { site: updated } = await withLoading(() =>
      apiPut(`/api/sites/${site._id}`, { theme })
    );
    setSite(updated);
  };

  return (
    <Card className='mt-6'>
      <form onSubmit={save} className='grid md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm text-gray-700'>Primary color</label>
          <Input
            type='color'
            value={theme.primary}
            onChange={(e) => setTheme({ ...theme, primary: e.target.value })}
          />
        </div>
        <div>
          <label className='block text-sm text-gray-700'>Accent color</label>
          <Input
            type='color'
            value={theme.accent}
            onChange={(e) => setTheme({ ...theme, accent: e.target.value })}
          />
        </div>
        <div>
          <label className='block text-sm text-gray-700'>Font</label>
          <select
            className='w-full rounded-lg border border-gray-200 px-3 py-2'
            value={theme.font}
            onChange={(e) => setTheme({ ...theme, font: e.target.value })}
          >
            <option>Inter</option>
            <option>Roboto</option>
            <option>System UI</option>
          </select>
        </div>
        <div>
          <span className='block text-sm text-gray-700 mb-2'>Logo</span>
          <FileUpload
            label={theme.logoUrl ? 'Change logo' : 'Upload logo'}
            onUploaded={(url) => setTheme({ ...theme, logoUrl: url })}
          />
          {theme.logoUrl && (
            <img
              src={theme.logoUrl}
              alt='logo'
              className='mt-3 h-12 object-contain'
            />
          )}
        </div>

        {/* mali vizuelni preview teme */}
        <div className='md:col-span-2'>
          <div className='p-4 rounded-xl border border-dashed border-gray-200'>
            <div className='text-sm text-gray-500'>Preview</div>
            <div
              className='mt-2 h-20 rounded-lg'
              style={{ background: theme.primary }}
            />
            <div
              className='mt-2 h-2 w-24 rounded'
              style={{ background: theme.accent }}
            />
            <div className='mt-1 text-sm'>{theme.font}</div>
          </div>
        </div>

        <div className='md:col-span-2'>
          <Button type='submit'>Save theme</Button>
        </div>
      </form>
    </Card>
  );
}

import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { apiPut } from '../../../../lib/api';
import { useLoading } from '../../../../contexts/LoadingContext';

export default function SiteOverviewTab() {
  const { site, setSite } = useOutletContext(); // { site, setSite } iz layout-a
  const [name, setName] = useState(site.name); // naziv sajta
  const [customDomain, setCustomDomain] = useState(site.customDomain || ''); // custom domen
  const { withLoading } = useLoading();

  // snimi izmene (ime + customDomain)
  const save = async (e) => {
    e.preventDefault();
    const { site: updated } = await withLoading(() =>
      apiPut(`/api/sites/${site._id}`, { name, customDomain })
    );
    setSite(updated);
  };

  return (
    <Card className='mt-6'>
      <form onSubmit={save} className='grid md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm text-gray-700'>Site name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className='block text-sm text-gray-700'>Custom domain</label>
          <Input
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            placeholder='example.com'
          />
        </div>
        <div className='md:col-span-2'>
          <Button type='submit'>Save changes</Button>
        </div>
      </form>
    </Card>
  );
}

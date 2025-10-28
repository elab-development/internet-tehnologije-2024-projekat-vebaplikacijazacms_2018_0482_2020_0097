import { useOutletContext } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import { apiPost } from '../../../../lib/api';
import { useLoading } from '../../../../contexts/LoadingContext';

export default function SitePublishTab() {
  const { site, setSite } = useOutletContext(); // {site,setSite}
  const { withLoading } = useLoading();

  // publish/unpublish opcija
  const toggle = async (published) => {
    const { site: updated } = await withLoading(() =>
      apiPost(`/api/sites/${site._id}/publish`, { published })
    );
    setSite(updated);
  };

  return (
    <Card className='mt-6'>
      <h3 className='text-lg font-semibold'>Publish</h3>
      <p className='text-gray-600 mt-2'>
        Current status: <b>{site.isPublished ? 'Published' : 'Draft'}</b>
      </p>
      <div className='mt-4 flex gap-3'>
        {!site.isPublished ? (
          <Button onClick={() => toggle(true)}>Publish site</Button>
        ) : (
          <button
            className='px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300'
            onClick={() => toggle(false)}
          >
            Unpublish
          </button>
        )}
      </div>
    </Card>
  );
}

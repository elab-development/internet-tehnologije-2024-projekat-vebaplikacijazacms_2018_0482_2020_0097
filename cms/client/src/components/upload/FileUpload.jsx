import { apiUpload } from '../../lib/api';
import { useLoading } from '../../contexts/LoadingContext';

export default function FileUpload({ onUploaded, label = 'Upload image' }) {
  const { withLoading } = useLoading(); // wrapper za prikaz globalnog loading overlay-a

  const onChange = async (e) => {
    const file = e.target.files?.[0]; // uzmi prvi izabran fajl
    if (!file) return;

    // spremi form-data za upload
    const fd = new FormData();
    fd.append('file', file);

    try {
      // backend vraća {url} posle upload-a
      const { url } = await withLoading(() =>
        apiUpload('/api/media/upload', fd)
      );
      onUploaded?.(url); // prosledi url roditeljskoj komponenti
    } catch (err) {
      alert(err.message || 'Upload failed'); // jednostavna greška
    } finally {
      e.target.value = ''; // resetuj input da bi se isti fajl mogao opet izabrati
    }
  };

  return (
    <label className='inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer'>
      {/* sakriveni <input type=file> - klikom na label-u otvara se file picker */}
      <input
        type='file'
        accept='image/*' // ograničenje na slike
        className='hidden'
        onChange={onChange}
      />
      {label} {/* tekst dugmeta, može da se prosledi preko props */}
    </label>
  );
}

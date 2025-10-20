import { useState } from 'react';
import Button from './Button';

// Prikazuje dugme (trigger) i modal za potvrdu akcije.
export default function ConfirmDialog({
  triggerLabel = 'Delete', // tekst dugmeta
  title = 'Are you sure?', // naslov modala
  body = 'This action cannot be undone.', // opis modala
  onConfirm, // callback na potvrdu
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Dugme koje otvara modal */}
      <button
        className='px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow'
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </button>
      {open && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
          <div className='bg-white rounded-xl shadow p-6 w-full max-w-sm'>
            <h4 className='text-lg font-semibold'>{title}</h4>
            <p className='mt-2 text-gray-600'>{body}</p>
            <div className='mt-6 flex justify-end gap-3'>
              {/* Cancel zatvara modal */}
              <button
                className='px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300'
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              {/* Confirm poziva callback i zatvara modal */}
              <Button
                onClick={async () => {
                  await onConfirm();
                  setOpen(false);
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

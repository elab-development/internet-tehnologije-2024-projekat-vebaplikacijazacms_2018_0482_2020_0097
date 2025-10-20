import { BLOCK_TYPES } from './BlockTypes';

export default function BlockPalette({ onAdd }) {
  // kad se vuče dugme sa palete, u dataTransfer ide tip bloka kao "new:<type>"
  const onDragStart = (e, type) => {
    e.dataTransfer.setData('text/plain', `new:${type}`);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  return (
    <div className='bg-white rounded-xl shadow p-4'>
      <div className='text-sm font-medium text-gray-700 mb-2'>Blocks</div>
      <div className='grid grid-cols-2 gap-2'>
        {BLOCK_TYPES.map((b) => (
          <button
            key={b.type}
            onClick={() => onAdd(b.type)} // klik = instant dodavanje
            draggable // drag = set payload
            onDragStart={(e) => onDragStart(e, b.type)}
            className='text-left px-3 py-2 rounded-lg border border-gray-200 hover:bg-blue-50 cursor-grab'
            title='Click to add; drag to place'
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}

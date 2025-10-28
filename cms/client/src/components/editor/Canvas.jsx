import BlockRenderer from './BlockRenderer';
import { canHaveChildren } from './utils';

// vizuelna drop zona između blokova / unutar kontejnera
function DropZone({ onDrop, onDragOver, hint = 'Drop here' }) {
  return (
    <div
      onDragOver={(e) => onDragOver(e)} // omogućava drop
      onDrop={(e) => onDrop(e)} // poziva parent handler sa pozicijom
      className='h-8 my-1 rounded-md border-2 border-dashed border-blue-200 flex items-center justify-center text-xs text-blue-600 bg-blue-50/40'
    >
      {hint}
    </div>
  );
}

export default function Canvas({
  nodes, // niz blokova za render
  parentId = null, // ID roditelja (null = root)
  selectedId, // trenutno selektovani blok
  onSelect, // set selekcije
  onAddChild, // setovanje destinacije za dodavanje
  onDelete, // brisanje
  onMoveUp, // pomeranje naviše
  onMoveDown, // pomeranje naniže
  onDragStart, // drag start za postojeći blok
  onDropTo, // handler za drop sa info {parentId,index}
}) {
  // dozvoli drop (default prevent)
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // helper koji vraća handler za drop na konkretan indeks
  const dropAt = (index) => (e) => {
    e.preventDefault();
    onDropTo?.({ parentId, index }, e);
  };

  // prazan kanvas: prikaži jednu drop zonu
  if (!nodes?.length) {
    return (
      <div className='space-y-2'>
        <DropZone
          onDragOver={handleDragOver}
          onDrop={dropAt(0)}
          hint='Drop block'
        />
        <div className='text-gray-500 text-sm'>
          Canvas is empty. Add blocks from the left.
        </div>
      </div>
    );
  }

  // lista blokova sa drop zonama iznad i ispod
  return (
    <div className='space-y-3'>
      {/* gornja drop zona */}
      <DropZone
        onDragOver={handleDragOver}
        onDrop={dropAt(0)}
        hint='Drop here (top)'
      />

      {nodes.map((node, idx) => (
        <div key={node.id} className='bg-white rounded-xl shadow p-3'>
          {/* alatke za redosled/brisanje */}
          <div className='flex items-center justify-between mb-2'>
            <div className='text-sm text-gray-600'>
              <span className='font-medium'>{node.type}</span>
              <span className='ml-2 text-gray-400'>#{node.id.slice(0, 6)}</span>
            </div>
            <div className='flex items-center gap-2'>
              <button
                className='px-2 py-1 rounded bg-gray-100 hover:bg-gray-200'
                onClick={() => onMoveUp(node.id)}
                title='Move up'
              >
                ↑
              </button>
              <button
                className='px-2 py-1 rounded bg-gray-100 hover:bg-gray-200'
                onClick={() => onMoveDown(node.id)}
                title='Move down'
              >
                ↓
              </button>
              <button
                className='px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700'
                onClick={() => onDelete(node.id)}
                title='Delete'
              >
                Delete
              </button>
            </div>
          </div>

          {/* render bloka */}
          <BlockRenderer
            node={node}
            selected={selectedId}
            onSelect={onSelect}
            onDragStart={onDragStart}
          />

          {/* ako blok može imati decu, rekurzivno prikaži pod-kanvas */}
          {canHaveChildren(node) && (
            <div className='mt-3 ml-2 border-l-2 border-dashed border-gray-200 pl-3'>
              {node.children?.length ? (
                <Canvas
                  nodes={node.children}
                  parentId={node.id}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onAddChild={onAddChild}
                  onDelete={onDelete}
                  onMoveUp={onMoveUp}
                  onMoveDown={onMoveDown}
                  onDragStart={onDragStart}
                  onDropTo={onDropTo}
                />
              ) : (
                <>
                  <DropZone
                    onDragOver={handleDragOver}
                    onDrop={dropAt(0)}
                    hint='Drop inside'
                  />
                  <div className='text-gray-400 text-sm'>No children</div>
                </>
              )}

              {/* dugme koje setuje pendingAddParent */}
              <div className='mt-2'>
                <button
                  className='px-3 py-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100'
                  onClick={() => onAddChild(node.id)}
                >
                  + Add block here
                </button>
              </div>
            </div>
          )}

          {/* donja drop zona ispod konkretnog bloka */}
          <DropZone
            onDragOver={handleDragOver}
            onDrop={dropAt(idx + 1)}
            hint='Drop here (below)'
          />
        </div>
      ))}
    </div>
  );
}

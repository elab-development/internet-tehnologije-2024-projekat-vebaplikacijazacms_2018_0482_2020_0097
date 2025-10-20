import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { apiGet, apiPut } from '../../../lib/api';
import { useLoading } from '../../../contexts/LoadingContext';

import BlockPalette from '../../../components/editor/BlockPalette';
import Inspector from '../../../components/editor/Inspector';
import Canvas from '../../../components/editor/Canvas';
import { defaultBlock } from '../../../components/editor/BlockTypes';
import {
  findNode,
  updateNode,
  addChild,
  removeNode,
  moveNode,
  moveNodeTo,
  insertInto,
} from '../../../components/editor/utils';

export default function PageEditor() {
  const { pageId } = useParams(); // ID stranice iz rute
  const nav = useNavigate();
  const [page, setPage] = useState(null); // ceo Page dokument
  const [error, setError] = useState(''); // tekst greške
  const [selectedId, setSelectedId] = useState(null); // trenutno selektovan blok
  const [pendingAddParent, setPendingAddParent] = useState(null); // gde će novi blok da se doda
  const { withLoading } = useLoading();

  useEffect(() => {
    (async () => {
      try {
        // učitavanje stranice za uređivanje
        const { page } = await withLoading(() =>
          apiGet(`/api/pages/${pageId}`)
        );
        setPage({
          ...page,
          blocks: Array.isArray(page.blocks) ? page.blocks : [], // garantujemo niz
        });
        setError('');
      } catch (e) {
        setError(e?.message || 'Failed to load page');
      }
    })();
  }, [pageId]);

  // memoizovan lookup selektovanog čvora po ID-u
  const selectedNode = useMemo(() => {
    if (!selectedId || !page?.blocks) return null;
    return findNode(page.blocks, selectedId);
  }, [selectedId, page?.blocks]);

  // povratak na listu strana konkretnog sajta
  const goBack = () => {
    if (page?.site) nav(`/sites/${page.site}/pages`);
    else nav(-1);
  };

  // dodavanje bloka klikom na paleti (u pendingAddParent ili root)
  const addBlockClick = (type) => {
    const node = defaultBlock(type); // fabrička kreacija bloka
    setPage((p) => ({
      ...p,
      blocks: addChild(p.blocks || [], pendingAddParent, node),
    }));
    setSelectedId(node.id); // automatski selektuj nov blok
  };
  // setovanje destinacije za dodavanje dece
  const addChildAt = (parentId) => setPendingAddParent(parentId);

  // inline akcije nad blokom
  const onDelete = (id) => {
    setPage((p) => ({ ...p, blocks: removeNode(p.blocks || [], id) }));
    if (selectedId === id) setSelectedId(null);
  };
  const onMoveUp = (id) =>
    setPage((p) => ({ ...p, blocks: moveNode(p.blocks || [], id, 'up') }));
  const onMoveDown = (id) =>
    setPage((p) => ({ ...p, blocks: moveNode(p.blocks || [], id, 'down') }));

  // promene props-a trenutno selektovanog bloka (iz Inspectora)
  const onChangeProps = (nextProps) => {
    if (!selectedId) return;
    setPage((p) => ({
      ...p,
      blocks: updateNode(p.blocks || [], selectedId, (node) => {
        node.props = nextProps;
        return node;
      }),
    }));
  };

  // Drag start za postojeći blok (Canvas → Canvas)
  const onDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id); // u payload ide ID bloka
    e.dataTransfer.effectAllowed = 'move';
  };

  // Drop (Canvas): razlikuje novi blok iz palete i postojeći blok
  const onDropTo = ({ parentId, index }, e) => {
    const payload = e.dataTransfer.getData('text/plain');
    if (!payload) return;

    if (payload.startsWith('new:')) {
      // dodavanje NOVOG bloka (iz palete)
      const type = payload.slice(4);
      const node = defaultBlock(type);
      setPage((p) => ({
        ...p,
        blocks: insertInto(p.blocks || [], parentId, index, node),
      }));
      setSelectedId(node.id);
      return;
    }

    // premeštanje POSTOJEĆEG bloka
    setPage((p) => ({
      ...p,
      blocks: moveNodeTo(p.blocks || [], payload, parentId, index),
    }));
  };

  // snimanje izmjena blokova na stranici
  const save = async () => {
    try {
      await withLoading(() =>
        apiPut(`/api/pages/${pageId}`, { blocks: page.blocks })
      );
      alert('Saved');
    } catch (e) {
      alert(e.message || 'Save failed');
    }
  };

  // fallback prikazi
  if (error) {
    return (
      <Card>
        <div className='flex items-center justify-between'>
          <button
            onClick={goBack}
            className='px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow'
          >
            ← Back
          </button>
          <h1 className='text-xl font-semibold'>Page editor</h1>
          <div />
        </div>
        <p className='mt-2 text-red-600'>{error}</p>
      </Card>
    );
  }
  if (!page) return null;

  // trenutno selektovani čvor (za Inspector)
  const rootSelected = selectedId ? findNode(page.blocks, selectedId) : null;

  // layout editora: paleta | canvas | inspector
  return (
    <div className='grid grid-cols-12 gap-4'>
      {/* Paleta blokova */}
      <div className='col-span-12 md:col-span-3'>
        <BlockPalette onAdd={addBlockClick} />
        {pendingAddParent ? (
          <div className='mt-3 text-xs text-blue-700 bg-blue-50 rounded-lg p-2'>
            Adding into:{' '}
            <span className='font-mono'>
              {String(pendingAddParent).slice(0, 8)}...
            </span>
            <br />
            Drag from palette or click to add.
          </div>
        ) : (
          <div className='mt-3 text-xs text-gray-500 bg-white rounded-lg p-2 shadow'>
            Click “+ Add block here” on canvas to set destination, then drag
            from palette or click to add to that container.
          </div>
        )}
        <div className='mt-4'>
          <Button onClick={() => setPendingAddParent(null)} className='w-full'>
            Add to root
          </Button>
        </div>
      </div>

      {/* Canvas za vizuelno slaganje blokova */}
      <div className='col-span-12 md:col-span-6'>
        <Card>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <button
                onClick={goBack}
                className='px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow'
                title='Back to Pages'
              >
                ← Back
              </button>
              <div>
                <h1 className='text-xl font-semibold'>Page editor</h1>
                <p className='text-gray-600'>
                  Title: {page.title} • Path: {page.path}
                </p>
              </div>
            </div>
            <Button onClick={save}>Save</Button>
          </div>

          <div className='mt-4'>
            <Canvas
              nodes={page.blocks || []}
              parentId={null}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onAddChild={addChildAt}
              onDelete={onDelete}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onDragStart={onDragStart}
              onDropTo={onDropTo}
            />
          </div>
        </Card>
      </div>

      {/* Inspector za editovanje props-a selektovanog bloka */}
      <div className='col-span-12 md:col-span-3'>
        <Inspector node={rootSelected} onChange={onChangeProps} />
      </div>
    </div>
  );
}

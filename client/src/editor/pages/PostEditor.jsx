import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import FileUpload from '../../components/upload/FileUpload';
import { apiGet, apiPut, apiPost } from '../../lib/api';
import { useLoading } from '../../contexts/LoadingContext';

import BlockPalette from '../../components/editor/BlockPalette';
import Inspector from '../../components/editor/Inspector';
import Canvas from '../../components/editor/Canvas';
import { defaultBlock } from '../../components/editor/BlockTypes';
import {
  findNode,
  updateNode,
  addChild,
  removeNode,
  moveNode,
  moveNodeTo,
  insertInto,
} from '../../components/editor/utils';

export default function PostEditor() {
  const { postId } = useParams(); // ID posta iz rute
  const nav = useNavigate();
  const { withLoading } = useLoading();

  const [post, setPost] = useState(null); // kompletan post objekat
  const [error, setError] = useState(''); // prikaz greške u UI
  const [selectedId, setSelectedId] = useState(null); // selektovani blok u editoru
  const [pendingAddParent, setPendingAddParent] = useState(null); // destinacija za dodavanje blokova

  useEffect(() => {
    // učitaj post
    (async () => {
      try {
        const { post } = await withLoading(() =>
          apiGet(`/api/posts/${postId}`)
        );
        setPost({
          ...post,
          // osiguraj da je blocks niz
          blocks: Array.isArray(post.blocks) ? post.blocks : [],
        });
        setError('');
      } catch (e) {
        setError(e?.message || 'Failed to load post');
      }
    })();
  }, [postId]);

  // referenca na trenutno selektovani blok (za Inspector)
  const selectedNode = useMemo(() => {
    if (!selectedId || !post?.blocks) return null;
    return findNode(post.blocks, selectedId);
  }, [selectedId, post?.blocks]);

  // back dugme – vrati na listu postova tog sajta
  const goBack = () => {
    if (post?.site) nav(`/me/sites/${post.site}/posts`);
    else nav(-1);
  };

  // ažuriranje meta podataka posta (title/slug/excerpt/coverImageUrl...)
  const updateMeta = (patch) => setPost((p) => ({ ...p, ...patch }));

  // --- Dodavanje blokova ---
  // klik iz palete → doda blok u pendingAddParent (ili root ako je null)
  const addBlockClick = (type) => {
    const node = defaultBlock(type);
    setPost((p) => ({
      ...p,
      blocks: addChild(p.blocks || [], pendingAddParent, node),
    }));
    setSelectedId(node.id);
  };
  // setuje u koji parent će sledeći blok biti dodat
  const addChildAt = (parentId) => setPendingAddParent(parentId);

  // --- Inline akcije nad blokovima ---
  const onDelete = (id) => {
    setPost((p) => ({ ...p, blocks: removeNode(p.blocks || [], id) }));
    if (selectedId === id) setSelectedId(null);
  };
  const onMoveUp = (id) =>
    setPost((p) => ({ ...p, blocks: moveNode(p.blocks || [], id, 'up') }));
  const onMoveDown = (id) =>
    setPost((p) => ({ ...p, blocks: moveNode(p.blocks || [], id, 'down') }));

  // update props-a selektovanog bloka iz Inspectora
  const onChangeProps = (nextProps) => {
    if (!selectedId) return;
    setPost((p) => ({
      ...p,
      blocks: updateNode(p.blocks || [], selectedId, (node) => {
        node.props = nextProps;
        return node;
      }),
    }));
  };

  // --- Drag & Drop ---
  // kad kreće DnD postojećeg bloka
  const onDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id); // upiši ID bloka
    e.dataTransfer.effectAllowed = 'move';
  };
  // drop destinacija – razlika: novi blok iz palete vs postojeći
  const onDropTo = ({ parentId, index }, e) => {
    const payload = e.dataTransfer.getData('text/plain');
    if (!payload) return;

    if (payload.startsWith('new:')) {
      // novi blok iz palete
      const type = payload.slice(4);
      const node = defaultBlock(type);
      setPost((p) => ({
        ...p,
        blocks: insertInto(p.blocks || [], parentId, index, node),
      }));
      setSelectedId(node.id);
      return;
    }

    // pomeranje postojećeg bloka
    setPost((p) => ({
      ...p,
      blocks: moveNodeTo(p.blocks || [], payload, parentId, index),
    }));
  };

  // snimi izmene posta (meta + blokovi)
  const save = async () => {
    try {
      await withLoading(() =>
        apiPut(`/api/posts/${postId}`, {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          coverImageUrl: post.coverImageUrl,
          blocks: post.blocks,
        })
      );
      alert('Saved');
    } catch (e) {
      alert(e.message || 'Save failed');
    }
  };

  // publish/unpublish
  const publish = async (published) => {
    try {
      await withLoading(() =>
        apiPost(`/api/posts/${postId}/publish`, { published })
      );
      // lokalno osveži status
      setPost((p) => ({
        ...p,
        status: published ? 'published' : 'draft',
        publishedAt: published ? new Date().toISOString() : undefined,
      }));
    } catch (e) {
      alert(e.message || 'Publish failed');
    }
  };

  // error ekran
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
          <h1 className='text-xl font-semibold'>Post editor</h1>
          <div />
        </div>
        <p className='mt-2 text-red-600'>{error}</p>
      </Card>
    );
  }
  if (!post) return null;

  // čvor za Inspector (na osnovu selekcije)
  const rootSelected = selectedId ? findNode(post.blocks, selectedId) : null;

  return (
    <div className='space-y-6'>
      {/* Header sa meta informacijama i akcijama */}
      <Card>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <button
              onClick={goBack}
              className='px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow'
            >
              ← Back
            </button>
            <div>
              <h1 className='text-xl font-semibold'>Post editor</h1>
              <div className='text-sm text-gray-500'>
                {post.status}
                {post.publishedAt
                  ? ` • ${new Date(post.publishedAt).toLocaleString()}`
                  : ''}
              </div>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {post.status === 'published' ? (
              <button
                onClick={() => publish(false)}
                className='px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 shadow'
              >
                Unpublish
              </button>
            ) : (
              <button
                onClick={() => publish(true)}
                className='px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow'
              >
                Publish
              </button>
            )}
            <Button onClick={save}>Save</Button>
          </div>
        </div>

        {/* Forma za meta polja posta */}
        <div className='mt-4 grid md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm text-gray-700'>Title</label>
            <Input
              value={post.title || ''}
              onChange={(e) => updateMeta({ title: e.target.value })}
            />
          </div>
          <div>
            <label className='block text-sm text-gray-700'>Slug</label>
            <Input
              value={post.slug || ''}
              onChange={(e) => updateMeta({ slug: e.target.value })}
            />
          </div>
          <div className='md:col-span-2'>
            <label className='block text-sm text-gray-700'>Excerpt</label>
            <textarea
              className='w-full rounded-lg border border-gray-200 px-3 py-2'
              rows={3}
              value={post.excerpt || ''}
              onChange={(e) => updateMeta({ excerpt: e.target.value })}
            />
          </div>
          <div className='md:col-span-2'>
            <label className='block text-sm text-gray-700'>Cover image</label>
            <div className='flex items-center gap-3'>
              <Input
                placeholder='https://...'
                value={post.coverImageUrl || ''}
                onChange={(e) => updateMeta({ coverImageUrl: e.target.value })}
              />
              {/* upload slike na backend, vraća url u coverImageUrl */}
              <FileUpload
                label='Upload'
                onUploaded={(url) => updateMeta({ coverImageUrl: url })}
              />
            </div>
            {post.coverImageUrl && (
              <img
                src={post.coverImageUrl}
                alt=''
                className='mt-3 max-h-40 rounded-lg object-cover'
              />
            )}
          </div>
        </div>
      </Card>

      {/* DnD blok editor (identično kao u PageEditor) */}
      <div className='grid grid-cols-12 gap-4'>
        {/* Paleta blokova i kontrola destinacije dodavanja */}
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
              from palette or click to add.
            </div>
          )}
          <div className='mt-4'>
            <Button
              onClick={() => setPendingAddParent(null)}
              className='w-full'
            >
              Add to root
            </Button>
          </div>
        </div>

        {/* Canvas sa blokovima */}
        <div className='col-span-12 md:col-span-6'>
          <Card>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-lg font-semibold'>Content blocks</h2>
                <p className='text-gray-600'>
                  Build the body of your post with blocks.
                </p>
              </div>
              <Button onClick={save}>Save</Button>
            </div>

            <div className='mt-4'>
              <Canvas
                nodes={post.blocks || []}
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

        {/* Inspector za selektovani blok */}
        <div className='col-span-12 md:col-span-3'>
          <Inspector node={rootSelected} onChange={onChangeProps} />
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { apiGet, apiPost } from '../../../../lib/api';
import { useLoading } from '../../../../contexts/LoadingContext';
import { useAuth } from '../../../../contexts/AuthContext';

// bedž za prikaz uloge uz korisnika
function RoleBadge({ role }) {
  const map = {
    admin: 'bg-purple-50 text-purple-700 border-purple-200',
    editor: 'bg-blue-50 text-blue-700 border-blue-200',
    user: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs border ${
        map[role] || map.user
      }`}
    >
      {role}
    </span>
  );
}

export default function SiteEditorsTab() {
  const { site, setSite } = useOutletContext(); // {site,setSite} iz parent layout-a
  const { user } = useAuth();
  const { withLoading } = useLoading();

  // dozvola izmene: owner ili admin
  const isOwnerOrAdmin = useMemo(() => {
    if (!site) return false;
    if (user?.role === 'admin') return true;
    return site.owners?.some((oid) => String(oid) === String(user?.id));
  }, [site, user]);

  // detalji trenutnih editora
  const [editorUsers, setEditorUsers] = useState([]); // [{_id,name,email,role}]

  // pretraga
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // povuci detalje trenutnih editora po ID-jevima
  const loadEditorsDetails = async (ids) => {
    if (!ids?.length) {
      setEditorUsers([]);
      return;
    }
    const { items } = await apiGet(`/api/users?ids=${ids.join(',')}`);
    setEditorUsers(items);
  };

  useEffect(() => {
    const ids = site?.editors?.map(String) || [];
    loadEditorsDetails(ids).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site?._id, site?.editors?.length]);

  // pretraga korisnika po q
  const searchUsers = async (e) => {
    e?.preventDefault?.();
    if (!q.trim()) {
      setResults([]);
      return;
    }
    try {
      setSearching(true);
      const { items } = await apiGet(
        `/api/users?q=${encodeURIComponent(q.trim())}&limit=20`
      );
      setResults(items);
    } finally {
      setSearching(false);
    }
  };

  // dodaj editora
  const addEditor = async (userId) => {
    if (!isOwnerOrAdmin) return;
    const { site: updated } = await withLoading(() =>
      apiPost(`/api/sites/${site._id}/editors`, { userId, action: 'add' })
    );
    setSite(updated);
    await loadEditorsDetails(updated.editors?.map(String) || []);
  };

  // ukloni editora
  const removeEditor = async (userId) => {
    if (!isOwnerOrAdmin) return;
    const { site: updated } = await withLoading(() =>
      apiPost(`/api/sites/${site._id}/editors`, { userId, action: 'remove' })
    );
    setSite(updated);
    await loadEditorsDetails(updated.editors?.map(String) || []);
  };

  return (
    <>
      {/* lista trenutnih editora */}
      <Card className='mt-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Editors</h3>
          {!isOwnerOrAdmin && (
            <span className='text-sm text-gray-500'>Owner/admin only</span>
          )}
        </div>

        {!editorUsers.length ? (
          <div className='text-gray-600 mt-2'>No editors yet.</div>
        ) : (
          <div className='mt-4 space-y-2'>
            {editorUsers.map((u) => (
              <div
                key={u._id}
                className='flex items-center justify-between bg-white rounded-lg border border-gray-100 shadow-sm p-3'
              >
                <div>
                  <div className='font-medium'>{u.name || u.email}</div>
                  <div className='text-sm text-gray-500'>{u.email}</div>
                </div>
                <div className='flex items-center gap-2'>
                  <RoleBadge role={u.role || 'user'} />
                  {isOwnerOrAdmin ? (
                    <button
                      className='px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200'
                      onClick={() => removeEditor(u._id)}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* pretraga i dodavanje novih editora */}
      <Card className='mt-6'>
        <h3 className='text-lg font-semibold'>Add editors</h3>

        <form onSubmit={searchUsers} className='mt-4 flex gap-3'>
          <Input
            placeholder='Search by name or email'
            value={q}
            onChange={(e) => setQ(e.target.value)}
            disabled={!isOwnerOrAdmin}
          />
          <Button type='submit' disabled={!isOwnerOrAdmin || searching}>
            {searching ? 'Searching…' : 'Search'}
          </Button>
        </form>

        <div className='mt-4'>
          {!q.trim() ? (
            <div className='text-gray-500 text-sm'>
              Type something and click Search to find users.
            </div>
          ) : !results.length ? (
            <div className='text-gray-600'>No users found.</div>
          ) : (
            <div className='space-y-2'>
              {results.map((u) => {
                // badge stanja: already editor / owner
                const already = site.editors?.some(
                  (id) => String(id) === String(u._id)
                );
                const isOwner = site.owners?.some(
                  (id) => String(id) === String(u._id)
                );
                return (
                  <div
                    key={u._id}
                    className='flex items-center justify-between bg-white rounded-lg border border-gray-100 shadow-sm p-3'
                  >
                    <div>
                      <div className='font-medium'>{u.name || u.email}</div>
                      <div className='text-sm text-gray-500'>{u.email}</div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <RoleBadge role={u.role || 'user'} />
                      {already ? (
                        <span className='px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500'>
                          Already editor
                        </span>
                      ) : isOwner ? (
                        <span className='px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500'>
                          Owner
                        </span>
                      ) : isOwnerOrAdmin ? (
                        <button
                          className='px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow'
                          onClick={() => addEditor(u._id)}
                        >
                          Add
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </>
  );
}

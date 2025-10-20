// ------- Tree helpers -------

// Šeta kroz celo drvo blokova i poziva fn za svaki čvor.
export function walk(nodes, fn, parent = null, indexPath = []) {
  nodes.forEach((n, i) => {
    fn(n, parent, i, indexPath);
    if (Array.isArray(n.children)) {
      walk(n.children, fn, n, [...indexPath, i]);
    }
  });
}

// Vraća jedan čvor iz drveta po id-u.
export function findNode(nodes, id) {
  let found = null;
  walk(nodes, (n) => {
    if (String(n.id) === String(id)) found = n;
  });
  return found;
}

// Ažurira čvor po id-u primenom updater funkcije.
export function updateNode(nodes, id, updater) {
  return nodes.map((n) => {
    if (n.id === id) return updater(structuredClone(n));
    if (n.children)
      return { ...n, children: updateNode(n.children, id, updater) };
    return n;
  });
}

// Uklanja čvor po id-u iz drveta.
export function removeNode(nodes, id) {
  const out = [];
  for (const n of nodes) {
    if (n.id === id) continue;
    if (n.children) out.push({ ...n, children: removeNode(n.children, id) });
    else out.push(n);
  }
  return out;
}

// Dodaje child čvor pod parentId ili na root ako parentId nije zadan.
export function addChild(nodes, parentId, newNode) {
  if (!parentId) return [...nodes, newNode];
  return updateNode(nodes, parentId, (p) => {
    const children = Array.isArray(p.children) ? p.children : [];
    p.children = [...children, newNode];
    return p;
  });
}

// Menja redosled čvora (up/down).
export function moveNode(nodes, id, direction = 'up') {
  function inner(arr) {
    const idx = arr.findIndex((n) => n.id === id);
    if (idx >= 0) {
      const target = direction === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= arr.length) return arr;
      const copy = [...arr];
      [copy[idx], copy[target]] = [copy[target], copy[idx]];
      return copy;
    }
    return arr.map((n) =>
      n.children ? { ...n, children: inner(n.children) } : n
    );
  }
  return inner(nodes);
}

// Proverava da li blok ima children (da li može da sadrži druge blokove).
export function canHaveChildren(block) {
  return Array.isArray(block?.children);
}

// ------- Drag & Drop helpers -------

// Nalazi parentId i index datog čvora.
export function findParentInfo(nodes, id, parentId = null) {
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.id === id) return { parentId, index: i };
    if (n.children?.length) {
      const got = findParentInfo(n.children, id, n.id);
      if (got) return got;
    }
  }
  return null;
}

// Uklanja čvor i vraća { removed, tree }.
export function removeNodeWithReturn(nodes, id) {
  let removed = null;
  function inner(arr) {
    const out = [];
    for (const n of arr) {
      if (n.id === id) {
        removed = n;
        continue;
      }
      if (n.children?.length) out.push({ ...n, children: inner(n.children) });
      else out.push(n);
    }
    return out;
  }
  const tree = inner(nodes);
  return { removed, tree };
}

// Proverava da li je testId potomak ancestorId.
export function isDescendant(nodes, ancestorId, testId) {
  const ancestor = findNode(nodes, ancestorId);
  if (!ancestor) return false;
  let found = false;
  walk([ancestor], (n) => {
    if (n.id === testId) found = true;
  });
  return found;
}

// Umeće čvor node u children parentId na index.
export function insertInto(nodes, parentId, index, node) {
  if (!parentId) {
    const copy = [...nodes];
    const i = Math.max(0, Math.min(index, copy.length));
    copy.splice(i, 0, node);
    return copy;
  }
  return updateNode(nodes, parentId, (p) => {
    const children = Array.isArray(p.children) ? [...p.children] : [];
    const i = Math.max(0, Math.min(index, children.length));
    children.splice(i, 0, node);
    p.children = children;
    return p;
  });
}

// Bezbedno premesta čvor id → targetParentId/targetIndex (ne dozvoljava drop u sopstveno podstablo).
export function moveNodeTo(nodes, id, targetParentId, targetIndex) {
  if (id === targetParentId) return nodes;
  if (targetParentId && isDescendant(nodes, id, targetParentId)) return nodes;

  const srcInfo = findParentInfo(nodes, id, null);
  if (!srcInfo) return nodes;

  const sameParent =
    String(srcInfo.parentId || '') === String(targetParentId || '');
  let adjIndex = targetIndex;

  const { removed, tree } = removeNodeWithReturn(nodes, id);
  if (!removed) return nodes;

  if (sameParent && srcInfo.index < targetIndex) {
    adjIndex = Math.max(0, targetIndex - 1);
  }
  return insertInto(tree, targetParentId, adjIndex, removed);
}

// Dozvoljeni blokovi u editoru (usklađeno sa postojećim UI-jem: Palette/Renderer/Inspector)
export const BLOCK_TYPES = [
  {
    type: 'section',
    label: 'Section',
    acceptsChildren: true,
    defaultProps: { bg: '#ffffff', pad: 16 },
  },
  {
    type: 'row',
    label: 'Row',
    acceptsChildren: true,
    defaultProps: { cols: 2, gap: 16 },
  },
  {
    type: 'col',
    label: 'Column',
    acceptsChildren: true,
    defaultProps: {},
  },
  {
    type: 'text',
    label: 'Text',
    acceptsChildren: false,
    defaultProps: { as: 'p', value: 'Your text here...' },
  },
  {
    type: 'image',
    label: 'Image',
    acceptsChildren: false,
    defaultProps: {
      src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNTDgvImR6wIziMPkT8lq0up10PNr35VYr1g&s',
      alt: 'placeholder',
    },
  },
  {
    type: 'button',
    label: 'Button',
    acceptsChildren: false,
    defaultProps: { label: 'Click me', href: '#' },
  },
  {
    type: 'hero',
    label: 'Hero',
    acceptsChildren: false,
    defaultProps: {
      title: 'Welcome',
      subtitle: 'Build fast with DnD',
      imageUrl:
        'https://www.engler-msr.de/media/k2/items/cache/184b7cb84d7b456c96a0bdfbbeaa5f14_Generic.jpg',
    },
  },
];

// Helper za instanciranje novog bloka po tipu
export function defaultBlock(type) {
  const spec = BLOCK_TYPES.find((b) => b.type === type);
  if (!spec) throw new Error('Unknown block type: ' + type);
  return {
    id: crypto.randomUUID(),
    type: spec.type,
    props: { ...spec.defaultProps },
    ...(spec.acceptsChildren ? { children: [] } : {}),
  };
}

export default [
  {
    id: 'hero1',
    type: 'hero',
    props: {
      title: 'Welcome',
      subtitle: 'Build fast with DnD',
      imageUrl: '/hero.png',
    },
  },
  {
    id: 'sec1',
    type: 'section',
    props: { bg: '#fff', pad: 12 },
    children: [
      {
        id: 'row1',
        type: 'row',
        props: { cols: 2 },
        children: [
          {
            id: 'col1',
            type: 'col',
            children: [
              {
                id: 't1',
                type: 'text',
                props: { as: 'h2', value: 'About us' },
              },
              {
                id: 't2',
                type: 'text',
                props: { value: 'Short description...' },
              },
              {
                id: 'btn1',
                type: 'button',
                props: { label: 'Contact', href: '#contact' },
              },
            ],
          },
          {
            id: 'col2',
            type: 'col',
            children: [
              {
                id: 'img1',
                type: 'image',
                props: { src: '/about.jpg', alt: 'About' },
              },
            ],
          },
        ],
      },
    ],
  },
];

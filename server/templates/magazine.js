export default [
  {
    id: 'hero1',
    type: 'hero',
    props: {
      title: 'Stories',
      subtitle: 'Latest highlights',
      imageUrl: '/cover.jpg',
    },
  },
  {
    id: 'sec1',
    type: 'section',
    props: { bg: '#f9fafb', pad: 10 },
    children: [
      {
        id: 'row1',
        type: 'row',
        props: { cols: 3 },
        children: [
          {
            id: 'col1',
            type: 'col',
            children: [
              {
                id: 'c1',
                type: 'text',
                props: { as: 'h3', value: 'Feature 1' },
              },
            ],
          },
          {
            id: 'col2',
            type: 'col',
            children: [
              {
                id: 'c2',
                type: 'text',
                props: { as: 'h3', value: 'Feature 2' },
              },
            ],
          },
          {
            id: 'col3',
            type: 'col',
            children: [
              {
                id: 'c3',
                type: 'text',
                props: { as: 'h3', value: 'Feature 3' },
              },
            ],
          },
        ],
      },
    ],
  },
];

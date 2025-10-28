// Prikazuje prazno stanje – poruku i opcioni action dugmić.
export default function EmptyState({
  title = 'Nothing here',
  subtitle = '',
  action = null,
}) {
  return (
    <div className='text-center py-16 bg-white rounded-xl shadow'>
      <h3 className='text-lg font-medium text-gray-900'>{title}</h3>
      {subtitle && <p className='mt-2 text-gray-500'>{subtitle}</p>}
      {action && <div className='mt-6'>{action}</div>}
    </div>
  );
}

import badge from 'lib/assets/badge.svg';

export function Loader() {
  return (
    <div className="flex items-center justify-center h-64">
      <img src={badge.src} className="animate-bounce h-12" />
    </div>
  )
}
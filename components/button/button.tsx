import cx from 'classnames';
import { Loader } from 'react-feather';

export function Button({ block = false, loading = false, children, ...rest }) {
  return (
    <button
      className={cx(
        'bg-red-600 hover:bg-red-700 transition-all px-3 py-2 rounded-sm font-mono items-center justify-center',
        block ? 'flex w-full' : 'inline-flex'
      )}
      {...rest}>
      {children}
      {loading && (
        <Loader className="animate-spin w-5 ml-2" />
      )}
    </button>
  )
}
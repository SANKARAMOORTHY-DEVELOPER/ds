import Link from 'next/link';
import cx from 'classnames';
import { ItemNFT } from 'lib/interfaces';
import { formatBigNumber } from 'lib/utils';
import BigNumber from "bignumber.js"

export function ItemCard({ item }: { item: ItemNFT }) {
  return (
    <Link href={`/items/${item.id}`}>
      <a className={cx('text-white bg-gray-900 overflow-hidden rounded-sm block', { 'animate-pulse': item.price === undefined })}>
        <span
          className="block bg-cover bg-center"
          style={{ width: '100%', paddingBottom: '100%', backgroundImage: `url(${item.metadata.image})` }}
        />
        <span className={cx('block p-4', { 'invisible': !item.price })}>
          <span className="font-semibold">{item.metadata.name}</span>
          <hr className="mt-2.5 mb-3 border-gray-700 border-dashed" />
          <span className="font-mono block">
            <span className="text-sm">
              {formatBigNumber(new BigNumber(item.price))} CELO
            </span>
          </span>
        </span>
      </a>
    </Link>
  )
}
import { forwardRef, HTMLProps } from 'react';
import { ChevronDown } from 'react-feather';

interface Props extends HTMLProps<HTMLSelectElement> {
  label: string;
  options: {
    label: string;
    value: string | number;
  }[]
}

function SelectComponent({ label, options, ...rest }: Props, ref) {
  return (
    <label className="block relative border border-gray-400 bg-black bg-opacity-10 rounded-sm">
      <span className="block text-sm font-semibold p-3 pb-0 text-white text-opacity-80">{label}</span>
      <select
        ref={ref}
        {...rest}
        className="appearance-none block w-full bg-transparent outline-none p-3 pt-1 font-mono">
        {options.map(option => (
          <option value={option.value}>{option.label}</option>
        ))}
      </select>
      <span className="absolute right-2 top-0 bottom-0 flex items-center">
        <ChevronDown className="w-5" />
      </span>
    </label>
  )
}

export const Select = forwardRef(SelectComponent);
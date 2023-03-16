import { forwardRef } from "react"

function InputComponent({ label, ...rest }, ref) {
  return (
    <label className="block border border-gray-400 bg-black bg-opacity-10 rounded-sm">
      <span className="block text-sm font-semibold p-3 pb-0 text-white text-opacity-80">{label}</span>
      <input
        ref={ref}
        {...rest}
        autoComplete="off"
        className="block w-full bg-transparent outline-none p-3 pt-1 font-mono"
      />
    </label>
  )
}

export const Input = forwardRef(InputComponent);
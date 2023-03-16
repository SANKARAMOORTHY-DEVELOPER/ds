import { Header } from "..";

export function Layout({ children }) {
  return (
    <div id="layout" className='bg-gray-800 text-white min-h-screen antialiased'>
      <Header />
      {children}
    </div>
  )
}
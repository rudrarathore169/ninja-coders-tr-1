import React from 'react'
import { Outlet } from 'react-router-dom'

const AdminLayout = () => {
  return (
    <div>
      <div className='flex w-full p-3 gap-5 font-bold text-2xl justify-evenly bg-amber-100'>
        <h1 className='px-2 py-2'>Dine Lite </h1>
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-utensils-crossed-icon lucide-utensils-crossed"><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/><path d="m2.1 21.8 6.4-6.3"/><path d="m19 5-7 7"/></svg>
        <button className='rounded-full shadow-md px-2 py-2 hover:bg-amber-800 duration-300 ease-in'>Orders</button>
        <button className='rounded-full shadow-md px-2 py-2 hover:bg-amber-800 duration-300 ease-in'>Dashboard</button>
        <button className='rounded-full shadow-md px-2 py-2 hover:bg-amber-800 duration-300 ease-in'>Menu</button>
        <button className='rounded-full shadow-md px-2 py-2 hover:bg-amber-800 duration-300 ease-in'>Table</button>
        <button className='rounded-full shadow-md px-2 py-2 hover:bg-amber-800 duration-300 ease-in' >Analytics</button>
      </div>
      <Outlet/>
    </div>
  )
}

export default AdminLayout
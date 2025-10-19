import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import Router from './Router/Router'

import './App.css'

function App() {
 

  return (
    <>
      <RouterProvider router={Router} />
    </>
  )
}

export default App

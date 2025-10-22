
import { RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import Router from './Router/Router'
import './App.css'

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={Router} />
    </Provider>
  )
}

export default App
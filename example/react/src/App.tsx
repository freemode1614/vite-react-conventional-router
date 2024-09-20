import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import routes from "virtual:routes"
import { createBrowserRouter, RouterProvider } from "react-router-dom";

function App() {
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 role='main'>Vite + React</h1>
      <div className="pages">
        <RouterProvider router={createBrowserRouter(routes)} fallbackElement={
          <div>
              Loading
          </div>
        } />
      </div>
    </>
  )
}

export default App

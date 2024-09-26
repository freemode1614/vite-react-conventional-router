import routes from "virtual:routes";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

function App() {
  return (
    <>
      <h1 role='main'>Vite + React</h1>
      <div className="pages">
        <RouterProvider router={createBrowserRouter(routes, { basename: import.meta.env.BASE_URL })} fallbackElement={
          <div>
            Loading
          </div>
        } />
      </div>
    </>
  )
}

export default App

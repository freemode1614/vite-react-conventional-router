import routes from "virtual:routes";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

const router = createBrowserRouter(routes);

function App() {
  return (
    <>
      <h1 role='main'>Vite + React</h1>
      <div className="pages">
        <RouterProvider router={router} fallbackElement={
          <div>
            Loading...
          </div>
        } />
      </div>
    </>
  )
}

export default App

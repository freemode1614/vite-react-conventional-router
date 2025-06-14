import routes from "virtual:routes";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./index.css";

// @ts-expect-error ignore below error
const router = createBrowserRouter(routes);

function App() {
  return (
    <>
      <h1 role="main">Vite + React</h1>
      <div className="pages">
        <RouterProvider router={router} />
      </div>
    </>
  );
}

export default App;

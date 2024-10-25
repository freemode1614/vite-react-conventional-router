import { Outlet, useNavigate } from "react-router";
import { useBeforeUnload } from "react-router-dom";


Component.displayName = 'page1'

export default function Component() {
  const nav = useNavigate()
  useBeforeUnload(
    () => {
      debugger;
    }
  )
  return <div>
    <span role="heading">page1/index.tsx</span><br />
    <button onClick={() => nav(-1)}>BACK</button>
    <Outlet />
  </div>
}

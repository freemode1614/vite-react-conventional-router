import { Outlet, useNavigate } from "react-router"

Component.displayName = 'page1'

export default function Component() {
  const nav = useNavigate()
  return <div>
    <span role="heading">page1/index.tsx</span>
    <button onClick={() => nav(-1)}>BACK</button>
    <Outlet />
  </div>
}

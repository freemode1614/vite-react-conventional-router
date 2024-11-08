import { Outlet, useNavigate, useOutlet } from "react-router";

Component.displayName = 'page1'

export default function Component() {
  const nav = useNavigate();
  const outlet = useOutlet();

  console.log(outlet);

  return <div>
    <span role="heading">page1/index.tsx</span><br />
    <button onClick={() => nav(-1)}>BACK</button>
    <Outlet />
  </div>
}

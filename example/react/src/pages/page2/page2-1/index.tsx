import { Outlet, useNavigate } from "react-router";

export const shouldValidate = false;

Component.displayName = 'page2-1';

export default function Component() {
  const nav = useNavigate();
  return <div>
    <span role="heading">page2/page2-1/index.tsx</span>
    <button onClick={
      () => nav('page2-1-1')
    }>page2-1-1</button>
    <Outlet />
  </div>
}

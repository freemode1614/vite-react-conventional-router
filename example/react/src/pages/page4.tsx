import { Outlet, useNavigate } from "react-router";

export const shouldValidate = false;

Component.displayName = 'page4';

export default function Component() {
  const nav = useNavigate();
  return <div>
    <span role="heading">page4.tsx</span>
    <button onClick={
      () => nav('list')
    }>List</button>
    <Outlet />
  </div>
}

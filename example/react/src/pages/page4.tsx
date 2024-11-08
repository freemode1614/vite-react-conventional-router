import { Outlet, useLoaderData, useNavigate } from "react-router";

export const shouldValidate = false;

Component.displayName = 'page4';

export default function Component() {
  const nav = useNavigate();
  const { name } = useLoaderData() as { name: string };
  return <div>
    <h1>{name}</h1>
    <span role="heading"> page4.tsx </span>
    <button onClick={
      () => nav('list')
    }>List</button>
    <Outlet />
  </div>
}

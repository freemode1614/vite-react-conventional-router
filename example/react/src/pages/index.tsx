import { useLoaderData, useNavigate } from "react-router";

export const shouldRevalidate = false;

Component.displayName = 'index';

export default function Component() {
  const nav = useNavigate();
  const data = useLoaderData() as { name: string }
  return <div>
    <h1 role="alert">{data.name}</h1>
    <span role="heading">index.tsx</span><br />
    <button onClick={
      () => nav('page1', { viewTransition: true })
    }>page1</button>
    <button onClick={
      () => nav('page2', { viewTransition: true })
    }>page2</button>
    <button onClick={
      () => nav('page3/page3-1/page3-1-1', { viewTransition: true })
    }>page3</button>
    <button onClick={
      () => nav('page4', { viewTransition: true })
    }>page4</button>
  </div>
}

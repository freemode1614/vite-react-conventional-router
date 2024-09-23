import { useNavigate } from "react-router";

export const shouldValidate = false;

Component.displayName = 'page1-1';

export default function Component() {
  const nav = useNavigate();
  return <div>
    <span role="heading" className="page1-1">page1/page1-1.tsx</span>
    <button onClick={
      () => nav(-1)
    }>/</button>
  </div>
}

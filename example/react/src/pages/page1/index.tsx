import { Outlet, useNavigate } from "react-router";

Component.displayName = "page1";

export default function Component() {
  const nav = useNavigate();

  return (
    <div className="page-1" style={{ viewTransitionName: "page-one" }}>
      <span role="heading">page1/index.tsx</span>
      <br />
      <button onClick={() => nav(-1)}>BACK</button>
      <Outlet />
    </div>
  );
}

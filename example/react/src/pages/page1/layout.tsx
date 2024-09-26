import { Outlet } from "react-router";

export default function PageOneLayout() {
  return <div role="main">
    <span>PageOneLayout</span>
    <Outlet />
  </div>
}

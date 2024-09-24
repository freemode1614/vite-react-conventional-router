import { Outlet } from "react-router";

export default function RootLayout() {
  return <div role="main">
    <h1>Root Layout</h1>
    <Outlet />
  </div>
}

import { Outlet } from "react-router";

export default function RootLayout() {
  return (
    <div role="main">
      <span>Root Layout</span>
      <Outlet />
    </div>
  );
}

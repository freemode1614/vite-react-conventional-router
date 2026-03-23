import { useRouteError } from "react-router";

export default function TestErrorBoundary() {
  const error = useRouteError();
  return <div>Error: {(error as Error).message}</div>;
}

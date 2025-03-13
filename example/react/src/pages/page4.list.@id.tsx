import { useNavigate, useParams } from "react-router";

export const shouldValidate = false;

Component.displayName = "page4";

export default function Component() {
  const nav = useNavigate();
  const { id } = useParams();
  return (
    <div>
      <span role="heading">page4.list.{id}.tsx</span>
      <button onClick={() => nav("/")}>back</button>
    </div>
  );
}

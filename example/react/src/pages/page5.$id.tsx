import { useNavigate, useParams } from "react-router";

export const shouldValidate = false;

Component.displayName = 'page5';

export function Component() {
    const { id } = useParams();
    const nav = useNavigate();
    return <div>
        <span role="heading">page5.@id.tsx ({id})</span>
        <button onClick={
            () => nav(-1)
        }>back</button>
     </div>
}
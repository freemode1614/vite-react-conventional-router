import { useNavigate } from "react-router";

export const shouldValidate = false;

Component.displayName = 'page4';

export function Component() {
    const nav = useNavigate();
    return <div>
        <span role="heading">page4.list.@id.tsx</span>
        <button onClick={
            () => nav(-1)
        }>back</button>
     </div>
}
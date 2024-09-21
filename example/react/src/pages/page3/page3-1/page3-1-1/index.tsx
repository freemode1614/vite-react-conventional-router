import { useNavigate } from "react-router";

export const shouldValidate = false;

Component.displayName = 'page2-1-1';

export function Component() {
    const nav = useNavigate();
    return <div>
        <span role="heading">page3/page3-1/page3-1-1/index.tsx</span>
        <button onClick={
            () => nav('/')
        }>/</button>
     </div>
}
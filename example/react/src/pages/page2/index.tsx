import { Outlet, useNavigate } from "react-router";

export const shouldValidate = false;

Component.displayName = 'page2';

export function Component() {
    const nav = useNavigate();
    return <div>
        <span role="heading">page2/index.tsx</span>
        <button onClick={
            () => nav('page2-1')
        }>page2-1</button>
        <Outlet />
     </div>
}
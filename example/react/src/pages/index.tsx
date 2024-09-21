import { useNavigate } from "react-router";

export const shouldValidate = false;

Component.displayName = 'index';

export function Component() {
    const nav = useNavigate();
    return <div> 
    <span role="heading">index.tsx</span>
        <button onClick={
            () => nav('page1')
        }>page1</button>
        <button onClick={
            () => nav('page2')
        }>page2</button>
     </div>
}
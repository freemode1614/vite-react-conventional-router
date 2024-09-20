import { useNavigate } from "react-router";

export const shouldValidate = false;

export default function HomdeIndex() {
    const nav = useNavigate();
    return <div role="headling"> index.tsx
        <button onClick={
            () => nav('home')
        }>Home</button>
     </div>
}
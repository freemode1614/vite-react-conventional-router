import { useRouteError } from "react-router";

const ErrorElement = ({error}: { error: Error }) => {
    return <div> Shit Happens: {error.message} </div>
}

export default function Error() {
    const error = useRouteError();
    return error  ? <ErrorElement error={error as Error} /> : null
}
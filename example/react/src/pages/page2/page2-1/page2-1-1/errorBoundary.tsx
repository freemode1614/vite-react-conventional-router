import { useRouteError } from "react-router";

const ErrorElement = ({ error }: { error: Error }) => {
  return <div style={{
    padding: '1rem',
    borderRadius: '0.5rem',
    backgroundColor: "darkred"
  }}>
    <h1 style={{ color: 'white', fontWeight: 900 }}>
      SOME THING WRONG!!!
    </h1>
    <div style={{ fontSize: '1.45rem', backgroundColor: 'black', color: "white", borderRadius: '0.5rem', padding: '1rem' }}>
      {error.stack?.toString().split("at").map(
        (stack, index) => {
          return <><span key={stack}>{`${index !== 0 ? "at" : ""} ${stack}`}</span><br /></>
        }
      )}
    </div>
  </div>
}

export default function Error() {
  const error = useRouteError();
  return error ? <ErrorElement error={error as Error} /> : null
}

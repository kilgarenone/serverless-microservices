import { h, Component } from "preact";

async function apiCall() {
  const response = await fetch(process.env.ORDERS_ENDPOINT).then((res) =>
    res.json()
  );
  console.log("API endpoint response:", response);
}

// eslint-disable-next-line import/prefer-default-export
export function App() {
  return (
    <div>
      <button onClick={apiCall}>Call an endpoint from server</button>;
    </div>
  );
}

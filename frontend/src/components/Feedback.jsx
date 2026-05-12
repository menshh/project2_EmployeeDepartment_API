export function LoadingPanel({ text = 'Loading data...' }) {
  return <div className="notice loading">{text}</div>;
}

export function ErrorPanel({ text }) {
  if (!text) return null;
  return <div className="notice error">{text}</div>;
}

export function EmptyPanel({ text }) {
  return <div className="notice empty">{text}</div>;
}

import { useEffect, useId, useState, type ReactNode } from 'react';

type Props<T> = {
  title: string;
  description: string;
  emptyMessage: string;
  loadItems: () => Promise<T[]>;
  renderItems: (items: T[]) => ReactNode;
};

type LoadState<T> =
  | { status: 'loading' }
  | { status: 'success'; items: T[] }
  | { status: 'error'; message: string };

export function CapabilityCard<T>({
  title,
  description,
  emptyMessage,
  loadItems,
  renderItems,
}: Props<T>) {
  const headingId = useId();
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });

    void Promise.resolve()
      .then(loadItems)
      .then((items) => {
        if (!Array.isArray(items)) throw new Error('The API returned an invalid list');
        if (active) setState({ status: 'success', items });
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : String(error),
          });
        }
      });

    return () => {
      active = false;
    };
  }, [loadItems]);

  return (
    <section className="card h-100" aria-labelledby={headingId}>
      <div className="card-body">
        <h2 id={headingId} className="h4">{title}</h2>
        <p>{description}</p>
        {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {state.status === 'error' && (
          <p role="alert">Unable to load {title.toLowerCase()}: {state.message}</p>
        )}
        {state.status === 'success' && state.items.length === 0 && (
          <p role="status">{emptyMessage}</p>
        )}
        {state.status === 'success' && state.items.length > 0 && renderItems(state.items)}
      </div>
    </section>
  );
}

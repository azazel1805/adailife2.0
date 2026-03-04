import { useEffect } from 'react';
import App from '../src/App';

export default function HomePage() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const serviceWorkerUrl = `${window.location.origin}/service-worker.js`;
      navigator.serviceWorker.register(serviceWorkerUrl).catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
    }
  }, []);

  return <App />;
}

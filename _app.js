import { logHydrationMismatch } from './hydrationMismatchLogger';

function MyApp({ Component, pageProps }) {
  // Log hydration mismatches
  logHydrationMismatch();

  return <Component {...pageProps} />;
}

export default MyApp;

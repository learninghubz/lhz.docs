import {Redirect} from '@docusaurus/router';
import Head from '@docusaurus/Head';
import {useEffect} from 'react';

export default function Home() {
  // Immediate redirect via JavaScript
  useEffect(() => {
    window.location.replace('/lhz.docs/docs/intro');
  }, []);

  return (
    <>
      <Head>
        <meta httpEquiv="refresh" content="0; url=/lhz.docs/docs/intro" />
        <script dangerouslySetInnerHTML={{
          __html: `window.location.replace('/lhz.docs/docs/intro');`
        }} />
      </Head>
      <Redirect to="/docs/intro" />
    </>
  );
}

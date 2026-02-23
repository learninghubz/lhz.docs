import {Redirect} from '@docusaurus/router';
import Head from '@docusaurus/Head';

export default function Home() {
  return (
    <>
      <Head>
        <meta httpEquiv="refresh" content="0; url=/lhz.docs/docs/intro" />
      </Head>
      <Redirect to="/docs/intro" />
    </>
  );
}

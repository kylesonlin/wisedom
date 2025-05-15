import React from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/globals.css';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* Google tag (gtag.js) */}
        {GA_MEASUREMENT_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </Head>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </>
  );
} 
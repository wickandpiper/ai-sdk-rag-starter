import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <Main />
          <NextScript />
          {/* Suppress useLayoutEffect warning when rendering on the server */}
          {typeof window === 'undefined' ? (
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  // Suppress useLayoutEffect warnings when rendering on the server
                  // This is for React's development mode only
                  if (typeof window === 'undefined') {
                    const originalError = console.error;
                    console.error = (...args) => {
                      if (
                        typeof args[0] === 'string' &&
                        args[0].includes('useLayoutEffect does nothing on the server')
                      ) {
                        return;
                      }
                      originalError.apply(console, args);
                    };
                  }
                `,
              }}
            />
          ) : null}
        </body>
      </Html>
    );
  }
}

export default MyDocument; 
// Vercel serverless function for API Server
// Re-exports the Hono app from dist/index.js as a serverless function handler

// Import the app from the compiled output
// Vercel includes the dist folder in the deployment
import app from '../dist/index';

// Wrap app.fetch in a handler for Vercel
// Vercel expects a default export that handles Request -> Response
const handler = async (req: Request): Promise<Response> => {
  try {
    return await app.fetch(req);
  } catch (error) {
    console.error('[FATAL] Unhandled error in Vercel handler:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// Export for Vercel serverless function
export default handler;

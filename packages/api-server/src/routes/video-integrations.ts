import { Hono } from 'hono';
import { z } from 'zod';
import { getAdminClient } from '../lib/supabase';
import { success, created, noContent, errors, error } from '../lib/response';
import { getTenantFilter } from '../middleware/tenant';
// TODO: Install @listing-platform/booking package
// import { VideoMeetingService } from '@listing-platform/booking/services';

// Placeholder service
class VideoMeetingService {
  constructor(private supabase: any) {}
  async listIntegrations(userId: string) { return []; }
  async getIntegration(id: string): Promise<any> { return null; }
  async upsertIntegration(data: any) { return data; }
  async updateIntegration(id: string, data: any) { return data; }
  async deleteIntegration(id: string) { return; }
  async refreshToken(id: string) { return {}; }
}

export const videoIntegrationRoutes = new Hono();

// ============================================================================
// Validation Schemas
// ============================================================================

const createIntegrationSchema = z.object({
  provider: z.enum(['zoom', 'microsoft_teams']),
  accessToken: z.string().min(1),
  refreshToken: z.string().optional(),
  tokenExpiresAt: z.string().datetime().optional(),
  accountId: z.string().optional(),
  accountEmail: z.string().email().optional(),
  accountName: z.string().optional(),
  autoCreateMeetings: z.boolean().default(true),
  defaultMeetingSettings: z.record(z.unknown()).default({}),
  metadata: z.record(z.unknown()).default({}),
});

const updateIntegrationSchema = createIntegrationSchema.partial();

// ============================================================================
// Video Integration Routes
// ============================================================================

/**
 * GET /api/video-integrations
 * List all video integrations for the authenticated user
 */
videoIntegrationRoutes.get('/', async (c) => {
  try {
    const userId = c.get('user')?.id;
    if (!userId) {
      return errors.unauthorized(c, 'User ID is required');
    }

    const supabase = getAdminClient();
    const videoService = new VideoMeetingService(supabase);
    const integrations = await videoService.listIntegrations(userId);

    return success(c, { integrations });
  } catch (error) {
    return errors.internalError(c, error instanceof Error ? error.message : 'Failed to list video integrations');
  }
});

/**
 * GET /api/video-integrations/:id
 * Get a specific video integration
 */
videoIntegrationRoutes.get('/:id', async (c) => {
  try {
    const userId = c.get('user')?.id;
    if (!userId) {
      return errors.unauthorized(c, 'User ID is required');
    }

    const id = c.req.param('id');
    const supabase = getAdminClient();
    const videoService = new VideoMeetingService(supabase);
    const integration = await videoService.getIntegration(id);

    if (!integration || (integration as any).user_id !== userId) {
      return errors.notFound(c, 'Integration');
    }

    return success(c, { integration });
  } catch (error) {
    return errors.internalError(c, error instanceof Error ? error.message : 'Failed to get video integration');
  }
});

/**
 * POST /api/video-integrations
 * Create a new video integration
 */
videoIntegrationRoutes.post('/', async (c) => {
  try {
    const userId = c.get('user')?.id;
    if (!userId) {
      return errors.unauthorized(c, 'User ID is required');
    }

    const { tenant_id } = getTenantFilter(c);
    const body = await c.req.json();

    try {
      const validated = createIntegrationSchema.parse(body);
      const supabase = getAdminClient();
      const videoService = new VideoMeetingService(supabase);

      const integration = await videoService.upsertIntegration({
        userId,
        tenantId: tenant_id,
        ...validated,
        active: true,
      });

      return created(c, { integration });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errors.validationError(c, error.errors);
      }
      throw error;
    }
  } catch (error) {
    return errors.internalError(c, error instanceof Error ? error.message : 'Failed to create video integration');
  }
});

/**
 * PATCH /api/video-integrations/:id
 * Update a video integration
 */
videoIntegrationRoutes.patch('/:id', async (c) => {
  try {
    const userId = c.get('user')?.id;
    if (!userId) {
      return errors.unauthorized(c, 'User ID is required');
    }

    const id = c.req.param('id');
    const supabase = getAdminClient();
    const videoService = new VideoMeetingService(supabase);
    const integration = await videoService.getIntegration(id);

    if (!integration || (integration as any).user_id !== userId) {
      return errors.notFound(c, 'Integration');
    }

    const body = await c.req.json();

    try {
      const validated = updateIntegrationSchema.parse(body);
      const updated = await videoService.updateIntegration(id, validated);

      return success(c, { integration: updated });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errors.validationError(c, error.errors);
      }
      throw error;
    }
  } catch (error) {
    return errors.internalError(c, error instanceof Error ? error.message : 'Failed to update video integration');
  }
});

/**
 * DELETE /api/video-integrations/:id
 * Delete a video integration
 */
videoIntegrationRoutes.delete('/:id', async (c) => {
  try {
    const userId = c.get('user')?.id;
    if (!userId) {
      return errors.unauthorized(c, 'User ID is required');
    }

    const id = c.req.param('id');
    const supabase = getAdminClient();
    const videoService = new VideoMeetingService(supabase);
    await videoService.deleteIntegration(id);

    return noContent(c);
  } catch (error) {
    return errors.internalError(c, error instanceof Error ? error.message : 'Failed to delete video integration');
  }
});

/**
 * POST /api/video-integrations/:id/refresh-token
 * Refresh the access token for a video integration
 */
videoIntegrationRoutes.post('/:id/refresh-token', async (c) => {
  try {
    const userId = c.get('user')?.id;
    if (!userId) {
      return errors.unauthorized(c, 'User ID is required');
    }

    const id = c.req.param('id');
    const supabase = getAdminClient();
    const videoService = new VideoMeetingService(supabase);
    const refreshed = await videoService.refreshToken(id);

    return success(c, { integration: refreshed });
  } catch (error) {
    return errors.internalError(c, error instanceof Error ? error.message : 'Failed to refresh token');
  }
});

// ============================================================================
// OAuth Routes
// ============================================================================

/**
 * GET /api/video-integrations/oauth/zoom/initiate
 * Initiate Zoom OAuth flow
 */
videoIntegrationRoutes.get('/oauth/zoom/initiate', async (c) => {
  try {
    const zoomClientId = process.env.ZOOM_CLIENT_ID;
    const zoomClientSecret = process.env.ZOOM_CLIENT_SECRET;
    const redirectUri = process.env.ZOOM_REDIRECT_URI || `${process.env.API_URL || 'http://localhost:8080'}/api/video-integrations/oauth/zoom/callback`;

    if (!zoomClientId || !zoomClientSecret) {
      return errors.internalError(c, 'Zoom OAuth not configured');
    }

    const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${zoomClientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    return success(c, { authUrl });
  } catch (error) {
    return errors.internalError(c, error instanceof Error ? error.message : 'Failed to initiate Zoom OAuth');
  }
});

/**
 * GET /api/video-integrations/oauth/microsoft/initiate
 * Initiate Microsoft Teams OAuth flow
 */
videoIntegrationRoutes.get('/oauth/microsoft/initiate', async (c) => {
  try {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const redirectUri = process.env.MICROSOFT_REDIRECT_URI || `${process.env.API_URL || 'http://localhost:8080'}/api/video-integrations/oauth/microsoft/callback`;

    if (!clientId) {
      return errors.internalError(c, 'Microsoft OAuth not configured');
    }

    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=https://graph.microsoft.com/.default offline_access`;

    return success(c, { authUrl });
  } catch (error) {
    return errors.internalError(c, error instanceof Error ? error.message : 'Failed to initiate Teams OAuth');
  }
});

/**
 * GET /api/video-integrations/oauth/zoom/callback
 * Handle Zoom OAuth callback
 */
videoIntegrationRoutes.get('/oauth/zoom/callback', async (c) => {
  try {
    const userId = c.get('user')?.id;
    if (!userId) {
      return errors.unauthorized(c, 'User ID is required');
    }

    const code = c.req.query('code');
    if (!code) {
      return errors.badRequest(c, 'Authorization code is required');
    }

    const zoomClientId = process.env.ZOOM_CLIENT_ID;
    const zoomClientSecret = process.env.ZOOM_CLIENT_SECRET;
    const redirectUri = process.env.ZOOM_REDIRECT_URI || `${process.env.API_URL || 'http://localhost:8080'}/api/video-integrations/oauth/zoom/callback`;
    const { tenant_id } = getTenantFilter(c);

    if (!zoomClientId || !zoomClientSecret) {
      return errors.internalError(c, 'Zoom OAuth not configured');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${zoomClientId}:${zoomClientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json().catch(() => ({})) as { error_description?: string };
      return errors.badRequest(c, `Failed to exchange token: ${error.error_description || tokenResponse.statusText}`);
    }

    const tokens = await tokenResponse.json() as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

    // Get user info
    const userResponse = await fetch('https://api.zoom.us/v2/users/me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const userInfo = userResponse.ok ? (await userResponse.json() as {
      id?: string;
      email?: string;
      display_name?: string;
    }) : {};

    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : undefined;

    // Save integration
    const supabase = getAdminClient();
    const videoService = new VideoMeetingService(supabase);

    const integration = await videoService.upsertIntegration({
      userId,
      tenantId: tenant_id,
      provider: 'zoom',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt: expiresAt,
      accountId: userInfo.id,
      accountEmail: userInfo.email,
      accountName: userInfo.display_name,
      autoCreateMeetings: true,
      defaultMeetingSettings: {},
      metadata: {},
      active: true,
    });

    return success(c, { integration });
  } catch (error: any) {
    return errors.internalError(c, error.message || 'Failed to process Zoom OAuth callback');
  }
});

/**
 * GET /api/video-integrations/oauth/microsoft/callback
 * Handle Microsoft Teams OAuth callback
 */
videoIntegrationRoutes.get('/oauth/microsoft/callback', async (c) => {
  try {
    const userId = c.get('user')?.id;
    if (!userId) {
      return errors.unauthorized(c, 'User ID is required');
    }

    const code = c.req.query('code');
    if (!code) {
      return errors.badRequest(c, 'Authorization code is required');
    }

    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    const redirectUri = process.env.MICROSOFT_REDIRECT_URI || `${process.env.API_URL || 'http://localhost:8080'}/api/video-integrations/oauth/microsoft/callback`;
    const { tenant_id } = getTenantFilter(c);

    if (!clientId || !clientSecret) {
      return errors.internalError(c, 'Microsoft OAuth not configured');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        scope: 'https://graph.microsoft.com/.default offline_access',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json().catch(() => ({})) as { error_description?: string };
      return errors.badRequest(c, `Failed to exchange token: ${error.error_description || tokenResponse.statusText}`);
    }

    const tokens = await tokenResponse.json() as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

    // Get user info
    const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const userInfo = userResponse.ok ? (await userResponse.json() as {
      id?: string;
      mail?: string;
      userPrincipalName?: string;
      displayName?: string;
    }) : {};

    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : undefined;

    // Save integration
    const supabase = getAdminClient();
    const videoService = new VideoMeetingService(supabase);

    const integration = await videoService.upsertIntegration({
      userId,
      tenantId: tenant_id,
      provider: 'microsoft_teams',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt: expiresAt,
      accountId: userInfo.id,
      accountEmail: userInfo.mail || userInfo.userPrincipalName,
      accountName: userInfo.displayName,
      autoCreateMeetings: true,
      defaultMeetingSettings: {},
      metadata: {},
      active: true,
    });

    return success(c, { integration });
  } catch (error: any) {
    return errors.internalError(c, error.message || 'Failed to process Teams OAuth callback');
  }
});

import { NextRequest, NextResponse } from 'next/server';

// Supported API versions
const SUPPORTED_VERSIONS = ['1.0.0'];
const DEFAULT_VERSION = '1.0.0';

// Version header names
const VERSION_HEADER = 'X-API-Version';
const ACCEPT_HEADER = 'Accept';

// Version format regex
const VERSION_REGEX = /^application\/vnd\.example\.v(\d+\.\d+\.\d+)\+json$/;

export function apiVersioningMiddleware(req: NextRequest) {
  // Only apply to API routes
  if (!req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Get version from headers
  const versionHeader = req.headers.get(VERSION_HEADER);
  const acceptHeader = req.headers.get(ACCEPT_HEADER);

  let requestedVersion = DEFAULT_VERSION;

  // Check X-API-Version header first
  if (versionHeader) {
    if (!SUPPORTED_VERSIONS.includes(versionHeader)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Unsupported API version',
          message: `Supported versions: ${SUPPORTED_VERSIONS.join(', ')}`,
          code: 'UNSUPPORTED_VERSION'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'X-API-Version': DEFAULT_VERSION
          }
        }
      );
    }
    requestedVersion = versionHeader;
  }
  // Then check Accept header
  else if (acceptHeader) {
    const match = acceptHeader.match(VERSION_REGEX);
    if (match) {
      const version = match[1];
      if (!SUPPORTED_VERSIONS.includes(version)) {
        return new NextResponse(
          JSON.stringify({
            error: 'Unsupported API version',
            message: `Supported versions: ${SUPPORTED_VERSIONS.join(', ')}`,
            code: 'UNSUPPORTED_VERSION'
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'X-API-Version': DEFAULT_VERSION
            }
          }
        );
      }
      requestedVersion = version;
    }
  }

  // Add version to request headers for downstream use
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('X-API-Version', requestedVersion);

  // Create new request with version header
  const newRequest = new NextRequest(req.url, {
    headers: requestHeaders,
    method: req.method,
    body: req.body,
    cache: req.cache,
    credentials: req.credentials,
    integrity: req.integrity,
    keepalive: req.keepalive,
    mode: req.mode,
    redirect: req.redirect,
    referrer: req.referrer,
    referrerPolicy: req.referrerPolicy,
    signal: req.signal
  });

  // Process the request
  const response = NextResponse.next({
    request: newRequest
  });

  // Add version to response headers
  response.headers.set('X-API-Version', requestedVersion);
  response.headers.set('Content-Type', `application/vnd.example.v${requestedVersion}+json`);

  return response;
}

// Helper function to get current API version from request
export function getApiVersion(req: NextRequest): string {
  return req.headers.get(VERSION_HEADER) || DEFAULT_VERSION;
}

// Helper function to check if version is supported
export function isVersionSupported(version: string): boolean {
  return SUPPORTED_VERSIONS.includes(version);
}

// Helper function to get latest supported version
export function getLatestVersion(): string {
  return SUPPORTED_VERSIONS[SUPPORTED_VERSIONS.length - 1];
}

// Helper function to check if version is deprecated
export function isVersionDeprecated(version: string): boolean {
  // Add deprecation logic here when needed
  return false;
}

// Helper function to get deprecation notice
export function getDeprecationNotice(version: string): string | null {
  if (isVersionDeprecated(version)) {
    return `This API version (${version}) is deprecated. Please upgrade to version ${getLatestVersion()}.`;
  }
  return null;
} 
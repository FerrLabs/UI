/**
 * Stub API client for the auth UI package.
 *
 * The real client is expected to live in the consuming app (e.g. the FerrLabs
 * account portal) and be swapped in via a future injection mechanism. Until
 * then this stub keeps `tsc --noEmit` green and mirrors the shape the
 * components expect.
 *
 * TODO(auth): replace with a runtime-injected client once the auth app is
 * wired end-to-end. Tracked in FerrLabs/UI#NEW.
 */

export interface ApiUser {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName?: string | null;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export interface AuthApi {
  login(email: string, password: string): Promise<ApiUser>;
  register(email: string, password: string): Promise<ApiUser>;
  requestPasswordReset(email: string): Promise<void>;
  verifyPasswordReset(token: string, password: string): Promise<void>;
  verifyEmail(email: string, code: string): Promise<void>;
  resendVerification(email: string): Promise<void>;
  currentUser(): Promise<ApiUser | null>;
  logout(): Promise<void>;
}

const unimplemented = (endpoint: string): Promise<never> => {
  return Promise.reject(new ApiError(501, 'NOT_IMPLEMENTED', `${endpoint} — stub client, replace with real API`));
};

export const api: { auth: AuthApi } = {
  auth: {
    login: () => unimplemented('auth.login'),
    register: () => unimplemented('auth.register'),
    requestPasswordReset: () => unimplemented('auth.requestPasswordReset'),
    verifyPasswordReset: () => unimplemented('auth.verifyPasswordReset'),
    verifyEmail: () => unimplemented('auth.verifyEmail'),
    resendVerification: () => unimplemented('auth.resendVerification'),
    currentUser: () => unimplemented('auth.currentUser'),
    logout: () => unimplemented('auth.logout'),
  },
};

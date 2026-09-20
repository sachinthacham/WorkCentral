import { isAbsolute, join } from 'path';

/**
 * Root directory for user-uploaded files.
 *
 * Defaults to <cwd>/uploads for local development. In a deployed environment set
 * UPLOADS_DIR to a path outside the deployed code (on Azure App Service the
 * persistent share is /home, so /home/data/uploads survives redeploys).
 */
export function getUploadsRoot(): string {
  const configured = process.env.UPLOADS_DIR;
  if (!configured) return join(process.cwd(), 'uploads');
  return isAbsolute(configured) ? configured : join(process.cwd(), configured);
}

export function getAttachmentsDir(): string {
  return join(getUploadsRoot(), 'attachments');
}

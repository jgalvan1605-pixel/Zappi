import crypto from 'crypto';

/**
 * Valida la firma HMAC-SHA256 de los webhooks de Shopify
 */
export function verifyShopifyHmac(
  rawBody: string,
  hmacHeader: string | null,
  secret?: string | null
): boolean {
  const webhookSecret = secret || process.env.SHOPIFY_WEBHOOK_SECRET;

  // En entorno local o si no se ha fijado el secreto, permitir el paso con log informativo
  if (!webhookSecret) {
    if (process.env.NODE_ENV !== 'production') {
      return true;
    }
    return false;
  }

  if (!hmacHeader) return false;

  try {
    const calculatedHash = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody, 'utf8')
      .digest('base64');

    return crypto.timingSafeEqual(
      Buffer.from(calculatedHash, 'utf8'),
      Buffer.from(hmacHeader, 'utf8')
    );
  } catch {
    return false;
  }
}
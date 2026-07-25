/**
 * sanitize-error.ts
 *
 * Prevents raw internal server/DB error messages from being shown to users.
 * The backend may return psycopg2 exceptions, FK violations, raw SQL, table
 * names, etc. inside the `detail` field of a 4xx/5xx response. This helper
 * detects those patterns and replaces them with the provided fallback message.
 *
 * Usage:
 *   import { sanitizeApiError } from "@/lib/sanitize-error";
 *   throw new Error(sanitizeApiError(d.detail, "Something went wrong."));
 */

const INTERNAL_ERROR_PATTERNS = [
  "psycopg2",
  "DB error",
  "Database error",
  "ForeignKeyViolation",
  "ForeignKey",
  "violates foreign key",
  "violates not-null constraint",
  "UniqueViolation",
  "IntegrityError",
  "INSERT INTO",
  "UPDATE ",
  "DELETE FROM",
  "SELECT ",
  "users_legacy",
  "payment_orders",
  "sqlalchemy",
  "asyncpg",
  "pg.Error",
  "DETAIL: Key",
  "SQLSTATE",
  "relation \"",
  "column \"",
  "syntax error at",
  "Traceback",
  "Exception:",
];

/**
 * Returns `detail` if it looks like a safe, user-facing message.
 * Returns `fallback` if `detail` is missing or contains internal error patterns.
 *
 * @param detail  - The raw `detail` string from an API error response
 * @param fallback - A safe, generic message to show the user instead
 */
export function sanitizeApiError(
  detail: string | undefined | null,
  fallback: string
): string {
  if (!detail) return fallback;

  const isInternalError = INTERNAL_ERROR_PATTERNS.some((pattern) =>
    detail.includes(pattern)
  );

  return isInternalError ? fallback : detail;
}

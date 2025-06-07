import { createHash } from 'crypto'

/**
 * Google OAuth IDからUUIDを生成する関数
 * NextAuthとSupabaseの互換性を確保するため
 */
export function generateUuidFromGoogleId(googleId: string): string {
  // Google IDをハッシュ化してUUID形式に変換
  const hash = createHash('md5').update(googleId).digest('hex')
  // UUID v4形式に変換 (8-4-4-4-12)
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    hash.slice(12, 16),
    hash.slice(16, 20),
    hash.slice(20, 32),
  ].join('-')
}

/**
 * 文字列がUUID形式かどうかをチェック
 */
export function isValidUuid(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

/**
 * ユーザーIDを正規化（Google IDからUUIDに変換）
 */
export function normalizeUserId(userId: string): string {
  // 既にUUID形式の場合はそのまま返す
  if (isValidUuid(userId)) {
    return userId
  }

  // Google OAuth IDの場合はUUIDに変換
  return generateUuidFromGoogleId(userId)
}

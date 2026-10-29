export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')

export class ApiError extends Error {
  status: number | null
  path: string

  constructor(message: string, path: string, status: number | null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.path = path
  }
}

type QueryValue = string | number | undefined | null

export function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const url = new URL(`${API_BASE_URL}${path}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

export async function apiGet<T = unknown>(path: string, query?: Record<string, QueryValue>): Promise<T> {
  let response: Response
  try {
    response = await fetch(buildUrl(path, query), { method: 'GET', headers: { Accept: 'application/json' } })
  } catch {
    throw new ApiError(`Unable to reach the OTDR Predict API at ${API_BASE_URL}.`, path, null)
  }

  if (!response.ok) {
    let detail = ''
    try {
      const body = (await response.json()) as { detail?: unknown }
      if (typeof body?.detail === 'string') detail = body.detail
    } catch {
      // Non-JSON error bodies fall back to the status text.
    }
    throw new ApiError(detail || `Request failed with status ${response.status}.`, path, response.status)
  }

  return (await response.json()) as T
}

'use client'

import useSWR from 'swr'
import { apiGet } from './client'
import {
  buildFiberCollection,
  normalizeAlerts,
  normalizeFiber,
  normalizeFiberPage,
  normalizeMeasurements,
  normalizeMeta,
  normalizeRisk,
  isRecord,
  type FiberPage,
} from './normalize'

const swrOptions = {
  revalidateOnFocus: false,
  dedupingInterval: 10_000,
  keepPreviousData: true,
  shouldRetryOnError: false,
}

const MAX_PAGES = 200

/**
 * Retrieves the complete fiber dataset using only the documented `limit` / `offset` params,
 * so network-wide totals are never computed from a single page.
 */
async function fetchAllFibers() {
  const first = normalizeFiberPage(await apiGet('/fibers'))
  const pages: FiberPage[] = [first]
  const pageSize = first.items.length
  const seen = new Set(first.items.map((item) => String(item.fiber_id ?? item.id ?? '')))
  let fetched = pageSize

  for (let i = 0; i < MAX_PAGES && pageSize > 0; i++) {
    if (first.total !== null && fetched >= first.total) break
    const next = normalizeFiberPage(await apiGet('/fibers', { limit: pageSize, offset: fetched }))
    const fresh = next.items.filter((item) => !seen.has(String(item.fiber_id ?? item.id ?? '')))
    if (fresh.length === 0) break
    fresh.forEach((item) => seen.add(String(item.fiber_id ?? item.id ?? '')))
    pages.push({ ...next, items: fresh })
    fetched += next.items.length
    if (first.total === null && next.items.length < pageSize) break
  }

  return buildFiberCollection(pages)
}

export function useMeta() {
  return useSWR('/meta', async () => normalizeMeta(await apiGet('/meta')), swrOptions)
}

export function useFibers() {
  return useSWR('/fibers?all', fetchAllFibers, swrOptions)
}

export function useAlerts() {
  return useSWR('/alerts', async () => normalizeAlerts(await apiGet('/alerts')), swrOptions)
}

export function useFiber(id: string) {
  return useSWR(`/fibers/${id}`, async () => {
    const payload = await apiGet(`/fibers/${encodeURIComponent(id)}`)
    return normalizeFiber(isRecord(payload) ? payload : {})
  }, swrOptions)
}

export function useMeasurements(id: string) {
  return useSWR(`/fibers/${id}/measurements`, async () =>
    normalizeMeasurements(await apiGet(`/fibers/${encodeURIComponent(id)}/measurements`)), swrOptions)
}

export function useRisk(id: string) {
  return useSWR(`/fibers/${id}/risk`, async () =>
    normalizeRisk(await apiGet(`/fibers/${encodeURIComponent(id)}/risk`)), swrOptions)
}

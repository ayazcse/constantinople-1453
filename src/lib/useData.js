import { useEffect, useState } from 'react'

const cache = new Map()

/**
 * Fetches /data/json/{name}.json (produced by scripts/04_export.py) and
 * returns { data, loading, error }. Cached per session so switching pages
 * doesn't re-fetch the same table twice.
 */
export function useData(name) {
  const [state, setState] = useState(() =>
    cache.has(name)
      ? { data: cache.get(name), loading: false, error: null }
      : { data: null, loading: true, error: null }
  )

  useEffect(() => {
    if (cache.has(name)) {
      setState({ data: cache.get(name), loading: false, error: null })
      return
    }
    let cancelled = false
    fetch(`/data/json/${name}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${name}.json (${res.status})`)
        return res.json()
      })
      .then((json) => {
        if (cancelled) return
        cache.set(name, json)
        setState({ data: json, loading: false, error: null })
      })
      .catch((err) => {
        if (cancelled) return
        setState({ data: null, loading: false, error: err.message })
      })
    return () => {
      cancelled = true
    }
  }, [name])

  return state
}

/** Fetch several tables at once. Returns { data: {name: json}, loading, error }. */
export function useDataMany(names) {
  const [state, setState] = useState({ data: {}, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    Promise.all(
      names.map((n) =>
        cache.has(n)
          ? Promise.resolve([n, cache.get(n)])
          : fetch(`/data/json/${n}.json`)
              .then((r) => {
                if (!r.ok) throw new Error(`Failed to load ${n}.json`)
                return r.json()
              })
              .then((j) => {
                cache.set(n, j)
                return [n, j]
              })
      )
    )
      .then((pairs) => {
        if (cancelled) return
        setState({ data: Object.fromEntries(pairs), loading: false, error: null })
      })
      .catch((err) => {
        if (cancelled) return
        setState({ data: {}, loading: false, error: err.message })
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [names.join(',')])

  return state
}

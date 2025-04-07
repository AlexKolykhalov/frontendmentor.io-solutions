// @ts-check

import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";

export function serverClient(req, res) {
  return createServerClient(process.env.URL, process.env.ANON_KEY, {
    cookies: {
      getAll() {
	return parseCookieHeader(req.headers.cookie ?? "")
      },
      setAll(cookieToSet) {
	cookieToSet.forEach(({ name, value, options}) =>
	  res.appendHeader("Set-Cookie", serializeCookieHeader(name, value, options))
	)
      }
    }
  });
}

export function serverClientServiceRole(req, res) {
  return createServerClient(process.env.URL, process.env.SERVICE_KEY, {
    cookies: {
      getAll() {
	return parseCookieHeader(req.headers.cookie ?? "")
      },
      setAll(cookieToSet) {
	cookieToSet.forEach(({ name, value, options}) =>
	  res.appendHeader("Set-Cookie", serializeCookieHeader(name, value, options))
	)
      }
    }
  });
}

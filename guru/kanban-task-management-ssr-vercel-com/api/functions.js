// @ts-check

import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";

/**
 * Returns supabase client with "anonymous access".
 *
 * @param   {any} req
 * @param   {any} res
 * @returns {any}
 */
export function serverClient(req, res) {
  return createServerClient(process.env.URL ?? "", process.env.ANON_KEY ?? "", {
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

/**
 * Returns supabase client with "full access".
 *
 * @param   {any} req
 * @param   {any} res
 * @returns {any}
 */
export function serverClientServiceRole(req, res) {
  return createServerClient(process.env.URL ?? "" , process.env.SERVICE_KEY ?? "", {
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

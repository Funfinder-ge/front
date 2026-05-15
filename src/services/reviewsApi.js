/**
 * Reviews API client. Hits the v3 customer review endpoints.
 *   GET  /event/<id>/list   — public
 *   POST /event/<id>/create — requires customer_session_token cookie
 */

const BASE_URL = 'https://base.funfinder.ge/en/api/v3/review';

async function request(endpoint, { headers, ...options } = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(headers || {}),
    },
  });

  let body = null;
  try { body = await response.json(); } catch { /* empty body */ }

  if (!response.ok) {
    const err = new Error(body?.detail || body?.message || `HTTP ${response.status}`);
    err.status = response.status;
    err.body = body;
    throw err;
  }
  return body;
}

const reviewsApi = {
  listForEvent: (eventId) => request(`/event/${eventId}/list`),

  create: (eventId, { rating, comment = '' }) =>
    request(`/event/${eventId}/create`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    }),
};

export default reviewsApi;

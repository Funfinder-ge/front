/**
 * Reviews API client. Hits the v3 customer review endpoints.
 * List is public; create requires a session cookie (sent via credentials: include).
 */

const BASE_URL = 'https://base.funfinder.ge/en/api/v3/review';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include',
    ...options,
  };

  const response = await fetch(url, config);
  let body = null;
  try { body = await response.json(); } catch { body = null; }

  if (!response.ok) {
    const message = body?.detail || body?.message || `HTTP ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.body = body;
    throw err;
  }
  return body;
}

const reviewsApi = {
  listForEvent: (eventId) => request(`/event/${eventId}/list`),

  create: (eventId, payload) =>
    request(`/event/${eventId}/create`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export default reviewsApi;

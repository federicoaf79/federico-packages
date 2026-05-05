const DEFAULT_BASE_URL = 'https://plan-b.lat/api/v1';

export class PlanBClient {
  constructor({ apiKey, baseUrl = DEFAULT_BASE_URL, fetch: fetchImpl = globalThis.fetch } = {}) {
    if (!apiKey) {
      throw new Error('PlanBClient: apiKey is required');
    }
    if (!fetchImpl) {
      throw new Error('PlanBClient: no fetch implementation available');
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.fetch = fetchImpl;
  }

  async send({ to, message, channel, metadata } = {}) {
    if (!to) throw new Error('send: "to" is required');
    if (!message) throw new Error('send: "message" is required');
    if (!channel) throw new Error('send: "channel" is required');

    return this.#request('POST', '/send', { to, message, channel, metadata });
  }

  async getStatus(messageId) {
    if (!messageId) throw new Error('getStatus: "messageId" is required');
    return this.#request('GET', `/messages/${encodeURIComponent(messageId)}`);
  }

  async #request(method, path, body) {
    const res = await this.fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await res.text();
    const data = text ? safeJsonParse(text) : null;

    if (!res.ok) {
      const err = new Error(`Plan-B API ${method} ${path} failed: ${res.status} ${res.statusText}`);
      err.status = res.status;
      err.body = data ?? text;
      throw err;
    }

    return data;
  }
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export default PlanBClient;

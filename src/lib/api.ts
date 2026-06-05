type RequestOptions = Omit<RequestInit, "method" | "body">;

async function request<T>(
  method: string,
  url: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? "Request failed");
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export const api = {
  get<T>(url: string, options?: RequestOptions) {
    return request<T>("GET", url, undefined, options);
  },
  post<T>(url: string, body?: unknown, options?: RequestOptions) {
    return request<T>("POST", url, body, options);
  },
  put<T>(url: string, body?: unknown, options?: RequestOptions) {
    return request<T>("PUT", url, body, options);
  },
  delete<T = void>(url: string, options?: RequestOptions) {
    return request<T>("DELETE", url, undefined, options);
  },
};

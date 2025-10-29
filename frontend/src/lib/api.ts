export async function apiFetch(path: string, init: RequestInit = {}) {
    const base = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('jwt_token');
    const headers = new Headers(init.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }
    const url = path.startsWith('http') ? path : `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    const resp = await fetch(url, { ...init, headers, credentials: 'include' });
    return resp;
}
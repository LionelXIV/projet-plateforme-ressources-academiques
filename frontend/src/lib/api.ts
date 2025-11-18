const base = import.meta.env.VITE_API_URL || '';

export async function apiFetch(path: string, init: RequestInit = {}) {
    const token = localStorage.getItem('jwt_token');
    const headers = new Headers(init.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }
    const url = `${base}${path}`;
    const resp = await fetch(url, { ...init, headers, credentials: 'include' });
    return resp;
}

export async function getCourse(pk: number) {
    let idAny: any = pk;
    if (typeof pk === "object" && pk !== null) {
        idAny = (pk as any).id ?? (pk as any).pk ?? idAny;
    }
    const id = Number(idAny);
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Invalid course id");
    }
    const resp = await fetch(`${base}/courses/${id}/`, { method: 'GET' });
    if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        const err = body.error || body.detail || `HTTP ${resp.status}`;
        throw new Error(err);
    }
    return resp.json();
}

export async function deleteCourse(pk: number | string | { id?: number; pk?: number }) {
    let idAny: any = pk;
    if (typeof pk === "object" && pk !== null) idAny = (pk as any).id ?? (pk as any).pk ?? idAny;
    const id = Number(idAny);
    if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid course id");
    const resp = await apiFetch(`/courses/${id}/`, { method: "DELETE" });
    if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body.error || body.detail || `HTTP ${resp.status}`);
    }
    return resp.json();
}

export async function registerUser(username: string, password: string, email?: string) {
    const baseAuth = import.meta.env.VITE_API_URL_LOGIN || import.meta.env.VITE_API_URL || '';
    const url = `${baseAuth.replace(/\/$/, '')}/auth/register/`.replace(/\/{2,}/g, '/').replace(':/', '://');
    const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email }),
        credentials: 'include',
    });
    return resp;
}

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_staff: boolean;
    date_joined: string | null;
    statistics?: {
        courses_created: number;
    };
}

export async function getProfile(): Promise<UserProfile> {
    const resp = await apiFetch('/profile/');
    if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        const err = body.error || body.detail || `HTTP ${resp.status}`;
        throw new Error(err);
    }
    return resp.json();
}

export async function updateProfile(data: { email?: string; first_name?: string; last_name?: string }): Promise<UserProfile> {
    const resp = await apiFetch('/profile/update/', {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        const err = body.error || body.detail || `HTTP ${resp.status}`;
        throw new Error(err);
    }
    return resp.json();
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    const resp = await apiFetch('/profile/change-password/', {
        method: 'POST',
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });
    if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        const err = body.error || body.detail || `HTTP ${resp.status}`;
        throw new Error(err);
    }
    return resp.json();
}

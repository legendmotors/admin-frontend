export function setCookie(
    name: string,
    value: string,
    minute?: number,
    secure = true,
    sameSite: 'Strict' | 'Lax' | 'None' = 'Strict'
): void {
    let expires = "";
    if (minute) {
        const date = new Date();
        expires = "; expires=" + new Date(date.setMinutes(date.getMinutes() + minute)).toUTCString();
    }
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value || "")}${expires}; path=/; ${
        secure ? "Secure;" : ""
    } SameSite=${sameSite}`;
}

export function getCookie(name: string): string | null {
    const nameEQ = `${encodeURIComponent(name)}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

export function eraseCookie(name: string): void {
    document.cookie = `${encodeURIComponent(name)}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Secure; SameSite=Strict`;
}

import {
    clearAuthSession,
    getAuthSession,
    isRememberedSession,
    setAuthSession,
} from './helpersFoo';

describe('auth session storage', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    it('keeps checked Remember Me sessions across browser sessions', () => {
        const session = {jwt: 'persistent-token'};

        setAuthSession(session, true);

        expect(getAuthSession()).toEqual(session);
        expect(isRememberedSession()).toBe(true);
        expect(sessionStorage.getItem('rememberMe')).toBeNull();
    });

    it('stores unchecked Remember Me sessions only for the current browser session', () => {
        const session = {jwt: 'session-token'};

        setAuthSession(session, false);

        expect(getAuthSession()).toEqual(session);
        expect(isRememberedSession()).toBe(false);
        expect(localStorage.getItem('rememberMe')).toBeNull();
    });

    it('clears only authentication storage on logout', () => {
        localStorage.setItem('preference', 'keep');
        setAuthSession({jwt: 'token'}, true);

        clearAuthSession();

        expect(localStorage.getItem('rememberMe')).toBeNull();
        expect(localStorage.getItem('preference')).toBe('keep');
    });
});

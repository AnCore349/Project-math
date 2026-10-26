import JwtCheckingStore from './jwtChecking.store';
import {GET, POST} from '../requests/request';
import GlobalStore from '../GlobalStore/global.store';
import {getLocalStorage, setLocalStorage} from '../../helpers/helpersFoo';

jest.mock('../requests/request', () => ({
    GET: jest.fn(),
    POST: jest.fn(),
}));

jest.mock('../GlobalStore/global.store', () => ({
    __esModule: true,
    default: {
        addResponseToGlobalStore: jest.fn(),
        clearGlobalStore: jest.fn(),
    },
}));

jest.mock('../../helpers/helpersFoo', () => ({
    getLocalStorage: jest.fn(),
    setLocalStorage: jest.fn(),
}));

describe('JwtCheckingStore session restore', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        JwtCheckingStore.isInitialized = false;
        JwtCheckingStore.isRestoring = false;
        JwtCheckingStore.error = '';
    });

    it('restores a user with a valid stored access token', async () => {
        const session = {nickName: 'CryptoUser', jwt: 'access-token'};
        getLocalStorage.mockReturnValue({jwt: 'access-token'});
        POST.mockResolvedValue({data: session});

        await JwtCheckingStore.restoreSession();

        expect(POST).toHaveBeenCalledWith(
            'auth/jwtAccess',
            {jwt: 'access-token'},
            {jwt: 'access-token'},
        );
        expect(GET).not.toHaveBeenCalled();
        expect(setLocalStorage).toHaveBeenCalledWith(session, 'rememberMe');
        expect(GlobalStore.addResponseToGlobalStore).toHaveBeenCalledWith(session);
        expect(JwtCheckingStore.isInitialized).toBe(true);
    });

    it('refreshes an expired access token using the refresh cookie', async () => {
        const session = {nickName: 'CryptoUser', jwt: 'fresh-access-token'};
        getLocalStorage.mockReturnValue({jwt: 'expired-access-token'});
        POST.mockRejectedValueOnce({response: {status: 401}})
            .mockResolvedValueOnce({data: session});
        GET.mockResolvedValue({data: {jwt: 'fresh-access-token'}});

        await JwtCheckingStore.restoreSession();

        expect(GET).toHaveBeenCalledWith('auth/refresh-tokens');
        expect(POST).toHaveBeenLastCalledWith(
            'auth/jwtAccess',
            {jwt: 'fresh-access-token'},
            {jwt: 'fresh-access-token'},
        );
        expect(setLocalStorage).toHaveBeenCalledWith(session, 'rememberMe');
        expect(GlobalStore.addResponseToGlobalStore).toHaveBeenCalledWith(session);
    });

    it('clears a session when the refresh cookie is rejected', async () => {
        getLocalStorage.mockReturnValue(null);
        GET.mockRejectedValue({response: {status: 401}});
        const removeItem = jest.spyOn(Storage.prototype, 'removeItem');

        await JwtCheckingStore.restoreSession();

        expect(removeItem).toHaveBeenCalledWith('rememberMe');
        expect(GlobalStore.clearGlobalStore).toHaveBeenCalled();
        expect(JwtCheckingStore.error).toBe('');
        removeItem.mockRestore();
    });

    it('shows a retryable error instead of silently dropping the session on network failure', async () => {
        getLocalStorage.mockReturnValue({jwt: 'access-token'});
        POST.mockRejectedValue(new Error('Network unavailable'));

        await JwtCheckingStore.restoreSession();

        expect(JwtCheckingStore.error).toMatch(/проверьте соединение/i);
        expect(JwtCheckingStore.isInitialized).toBe(true);
        expect(GET).not.toHaveBeenCalled();
    });
});

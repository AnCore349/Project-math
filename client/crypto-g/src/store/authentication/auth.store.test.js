import AuthStore from './auth.store';
import {POST, PUT} from '../requests/request';
import GlobalStore from '../GlobalStore/global.store';
import ModalStore from '../modalWindow/modal.store';
import {getLocalStorage, setLocalStorage} from '../../helpers/helpersFoo';

jest.mock('../requests/request', () => ({
    POST: jest.fn(),
    PUT: jest.fn(),
}));

jest.mock('../GlobalStore/global.store', () => ({
    __esModule: true,
    default: {
        addResponseToGlobalStore: jest.fn(),
        clearGlobalStore: jest.fn(),
    },
}));

jest.mock('../modalWindow/modal.store', () => ({
    __esModule: true,
    default: {
        closeModal: jest.fn(),
    },
}));

jest.mock('../../helpers/helpersFoo', () => ({
    getLocalStorage: jest.fn(),
    setLocalStorage: jest.fn(),
}));

describe('AuthStore', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        AuthStore.error = '';
        AuthStore.isSubmitting = false;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('keeps the login form open and exposes API errors', async () => {
        POST.mockRejectedValue({
            response: {data: {message: 'Invalid email or password'}},
        });

        await expect(
            AuthStore.handleAddCredoLogin({email: 'user@example.com', password: 'wrong'}),
        ).resolves.toBe(false);

        expect(AuthStore.error).toBe('Invalid email or password');
        expect(ModalStore.closeModal).not.toHaveBeenCalled();
        expect(setLocalStorage).not.toHaveBeenCalled();
        expect(AuthStore.isSubmitting).toBe(false);
    });

    it('starts a session and closes the modal after successful login', async () => {
        const authResponse = {jwt: 'access-token', nickName: 'CryptoUser'};
        POST.mockResolvedValue({data: authResponse});

        await expect(
            AuthStore.handleAddCredoLogin({email: 'user@example.com', password: 'secret'}),
        ).resolves.toBe(true);

        expect(setLocalStorage).toHaveBeenCalledWith(authResponse, 'rememberMe');
        expect(GlobalStore.addResponseToGlobalStore).toHaveBeenCalledWith(authResponse);
        expect(ModalStore.closeModal).toHaveBeenCalledTimes(1);
        expect(AuthStore.error).toBe('');
    });

    it('uses the submitted nickname to start a session after registration', async () => {
        POST.mockResolvedValue({data: {jwt: 'access-token', email: 'user@example.com'}});
        const authenticatedUser = {jwt: 'access-token', nickName: 'CryptoUser'};

        await expect(
            AuthStore.handleAddCredoRegister({
                nickname: 'CryptoUser',
                email: 'user@example.com',
                password: 'secret',
            }),
        ).resolves.toBe(true);

        expect(setLocalStorage).toHaveBeenCalledWith(authenticatedUser, 'rememberMe');
        expect(GlobalStore.addResponseToGlobalStore).toHaveBeenCalledWith(authenticatedUser);
        expect(ModalStore.closeModal).toHaveBeenCalledTimes(1);
    });

    it('retains auth state when logout fails', async () => {
        getLocalStorage.mockReturnValue({jwt: 'access-token'});
        PUT.mockRejectedValue(new Error('Network unavailable'));
        jest.spyOn(console, 'log').mockImplementation(() => {});
        const clear = jest.spyOn(Storage.prototype, 'clear');

        await expect(AuthStore.handleLogOutUser()).resolves.toBe(false);

        expect(clear).not.toHaveBeenCalled();
        expect(GlobalStore.clearGlobalStore).not.toHaveBeenCalled();
    });
});

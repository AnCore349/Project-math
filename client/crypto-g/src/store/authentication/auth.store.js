import {makeAutoObservable} from "mobx";
import {POST, PUT} from "../requests/request";
import {
    FORGOT_PASSWORD_ROUTE,
    GOOGLE_LOGIN_ROUTE,
    LOGIN_ROUTE,
    LOGOUT_ROUT,
    REGISTER_ROUTE,
    SERVER_DEV_URL,
} from "../../serverRouting/switch";
import GlobalStore from "../GlobalStore/global.store";
import {
    clearAuthSession,
    getAuthSession,
    setAuthRememberChoice,
    setAuthSession,
} from "../../helpers/helpersFoo";
import ModalStore from "../modalWindow/modal.store";

class AuthStore {
    error = ''
    isSubmitting = false
    resetMessage = ''

    constructor() {
        makeAutoObservable(this)
    }

    clearError() {
        this.error = ''
        this.resetMessage = ''
    }

    getRequestErrorMessage(err) {
        const message = err?.response?.data?.message
        if (Array.isArray(message)) return message.join(', ')
        if (typeof message === 'string') return message
        return 'Не удалось выполнить запрос. Проверьте соединение и попробуйте ещё раз.'
    }

    async handleAddCredoLogin(payloadLogin, rememberMe = false) {
        this.error = ''
        this.isSubmitting = true
        try {
            const {data} = await POST(LOGIN_ROUTE, {...payloadLogin, rememberMe})
            setAuthSession(data, rememberMe)
            await GlobalStore.addResponseToGlobalStore(data)
            ModalStore.closeModal()
            return true
        } catch (err) {
            this.error = this.getRequestErrorMessage(err)
            return false
        } finally {
            this.isSubmitting = false
        }
    }

    async handleAddCredoRegister(payloadRegister) {
        this.error = ''
        this.isSubmitting = true
        try {
            const {data} = await POST(REGISTER_ROUTE, payloadRegister)
            const authenticatedUser = {
                jwt: data.jwt,
                nickName: payloadRegister.nickname,
            }
            setAuthSession(authenticatedUser, true)
            await GlobalStore.addResponseToGlobalStore(authenticatedUser)
            ModalStore.closeModal()
            return true
        } catch (err) {
            this.error = this.getRequestErrorMessage(err)
            return false
        } finally {
            this.isSubmitting = false
        }
    }

    startGoogleLogin(rememberMe) {
        setAuthRememberChoice(rememberMe)
        const url = new URL(GOOGLE_LOGIN_ROUTE, SERVER_DEV_URL)
        url.searchParams.set('rememberMe', rememberMe ? '1' : '0')
        window.location.assign(url.toString())
    }

    async requestPasswordReset(email) {
        this.error = ''
        this.resetMessage = ''
        this.isSubmitting = true
        try {
            const {data} = await POST(FORGOT_PASSWORD_ROUTE, {email})
            this.resetMessage = data.message
            return true
        } catch (err) {
            this.error = this.getRequestErrorMessage(err)
            return false
        } finally {
            this.isSubmitting = false
        }
    }

    async handleLogOutUser() {
        try {
            const jwtAccessFromStorage = getAuthSession()
            const res = await PUT(LOGOUT_ROUT, jwtAccessFromStorage)
            if (res.status === 200) {
                clearAuthSession()
                GlobalStore.clearGlobalStore()
                return true
            }
            return false
        } catch (err) {
            this.error = this.getRequestErrorMessage(err)
            return false
        }
    }
}

export default new AuthStore()

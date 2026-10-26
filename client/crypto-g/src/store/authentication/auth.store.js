import {makeAutoObservable} from "mobx";
import {POST, PUT} from "../requests/request";
import {LOGIN_ROUTE, LOGOUT_ROUT, REGISTER_ROUTE} from "../../serverRouting/switch";
import GlobalStore from "../GlobalStore/global.store";
import {getLocalStorage, setLocalStorage} from "../../helpers/helpersFoo";
import ModalStore from "../modalWindow/modal.store";


class AuthStore {
    error = ''
    isSubmitting = false

    constructor() {
        makeAutoObservable(this)
    }

    clearError() {
        this.error = ''
    }

    getRequestErrorMessage(err) {
        const message = err?.response?.data?.message
        if (Array.isArray(message)) return message.join(', ')
        if (typeof message === 'string') return message
        return 'Не удалось выполнить запрос. Проверьте соединение и попробуйте ещё раз.'
    }

    async handleAddCredoLogin(payloadLogin) {
        this.error = ''
        this.isSubmitting = true
        try {
            const {data} = await POST( LOGIN_ROUTE, payloadLogin)
            setLocalStorage(data, 'rememberMe')
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
            const {data} = await POST( REGISTER_ROUTE, payloadRegister)
            const authenticatedUser = {
                jwt: data.jwt,
                nickName: payloadRegister.nickname,
            }
            setLocalStorage(authenticatedUser, 'rememberMe')
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

    async handleLogOutUser() {
        try {
            const jwtAccessFromLocalStorage = getLocalStorage('rememberMe')
            const res = await PUT(LOGOUT_ROUT, jwtAccessFromLocalStorage)
            if (res.status === 200) {
                localStorage.clear()
                GlobalStore.clearGlobalStore()
                return true
            }
            return false
        } catch (err) {
            console.log(err)
            return false
        }
    }

}
export default new AuthStore()
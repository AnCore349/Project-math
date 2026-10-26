import {makeAutoObservable} from "mobx";
import {GET, POST} from "../requests/request";
import {ACCESS_ROUTE, REFRESH_TOKEN_ROUT} from "../../serverRouting/switch";
import GlobalStore from "../GlobalStore/global.store"
import {getLocalStorage, setLocalStorage} from "../../helpers/helpersFoo";

class JwtCheckingStore {
    isInitialized = false
    isRestoring = false
    error = ''

    constructor() {
        makeAutoObservable(this)
    }

    getErrorMessage(err) {
        const message = err?.response?.data?.message
        if (Array.isArray(message)) return message.join(', ')
        if (typeof message === 'string') return message
        return 'Не удалось проверить сессию. Проверьте соединение и повторите попытку.'
    }

    async getAuthenticatedUser(jwt) {
        const {data} = await POST(ACCESS_ROUTE, {jwt}, {jwt})
        return {nickName: data.nickName, jwt: data.jwt}
    }

    async restoreSession() {
        if (this.isRestoring) return
        this.isRestoring = true
        this.error = ''

        try {
            const storedSession = getLocalStorage('rememberMe')
            const jwt = storedSession?.jwt

            if (jwt) {
                try {
                    const authenticatedUser = await this.getAuthenticatedUser(jwt)
                    setLocalStorage(authenticatedUser, 'rememberMe')
                    await GlobalStore.addResponseToGlobalStore(authenticatedUser)
                    return
                } catch (err) {
                    if (err?.response?.status !== 401) throw err
                }
            }

            const {data} = await GET(REFRESH_TOKEN_ROUT)
            const authenticatedUser = await this.getAuthenticatedUser(data.jwt)
            setLocalStorage(authenticatedUser, 'rememberMe')
            await GlobalStore.addResponseToGlobalStore(authenticatedUser)
        } catch (err) {
            if (err?.response?.status === 401) {
                localStorage.removeItem('rememberMe')
                GlobalStore.clearGlobalStore()
            } else {
                this.error = this.getErrorMessage(err)
            }
        } finally {
            this.isRestoring = false
            this.isInitialized = true
        }
    }

    async addResponseToJwtCheckingStore() {
        try {
            const storedSession = getLocalStorage('rememberMe')
            if (!storedSession?.jwt) return
            const authenticatedUser = await this.getAuthenticatedUser(storedSession.jwt)
            setLocalStorage(authenticatedUser, 'rememberMe')
            await GlobalStore.addResponseToGlobalStore(authenticatedUser)
        } catch (err) {
            console.log(err)
        }
    }

}

export default new JwtCheckingStore()
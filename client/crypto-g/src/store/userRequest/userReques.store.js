import {makeAutoObservable} from "mobx";
import {DELETE, GET, POST} from "../requests/request";
import {DELETE_FAVORITE, GET_FAVORITES, SET_FAVORITE} from "../../serverRouting/switch";
import {getLocalStorage} from "../../helpers/helpersFoo";


class UserRequestStore {
    userFavoriteStore = []
    constructor() {
        makeAutoObservable(this)
    }

    async setFavoriteCrypto(payloadSetFavorite) {
        try {
            const jwtForFavorites = getLocalStorage('rememberMe')
            const response = await POST( SET_FAVORITE, payloadSetFavorite, jwtForFavorites)
            if (!Array.isArray(response?.data)) return false
            const {data} = response
            this.userFavoriteStore = data
            return true
        } catch (err) {
            console.log(err)
            return false
        }
    }

    async deleteFavoriteCrypto(payloadDeleteFavorite) {
        try {
            const jwtForFavorites = getLocalStorage('rememberMe')
            const response = await DELETE( DELETE_FAVORITE, payloadDeleteFavorite, jwtForFavorites)
            if (!Array.isArray(response?.data)) return false
            const {data} = response
            this.userFavoriteStore = data
            return true
        } catch (err) {
            console.log(err)
            return false
        }
    }

    async getFavoritesList() {
        try {
            const jwtForFavorites = getLocalStorage('rememberMe')
            const response = await GET( GET_FAVORITES, jwtForFavorites)
            if (!Array.isArray(response?.data?.watchlist)) return false
            const {data} = response
            this.userFavoriteStore = data.watchlist
            return data
        } catch (err) {
            console.log(err)
            return false
        }
    }
}
export default new UserRequestStore()
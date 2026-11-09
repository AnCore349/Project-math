import {makeAutoObservable} from "mobx";
import {DELETE, GET, POST} from "../requests/request";
import {DELETE_FAVORITE, GET_FAVORITES, SET_FAVORITE} from "../../serverRouting/switch";
import {getAuthSession} from "../../helpers/helpersFoo";


class UserRequestStore {
    userFavoriteStore = []
    isFavoritesLoading = false
    hasLoadedFavorites = false
    favoritesError = ''
    constructor() {
        makeAutoObservable(this)
    }

    async setFavoriteCrypto(payloadSetFavorite) {
        try {
            const jwtForFavorites = getAuthSession()
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
            const jwtForFavorites = getAuthSession()
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
        this.isFavoritesLoading = true
        this.favoritesError = ''
        try {
            const jwtForFavorites = getAuthSession()
            const response = await GET( GET_FAVORITES, jwtForFavorites)
            if (!Array.isArray(response?.data?.watchlist)) {
                this.favoritesError = 'Could not load your favorite cryptocurrencies.'
                return false
            }
            const {data} = response
            this.userFavoriteStore = data.watchlist
            this.hasLoadedFavorites = true
            return data
        } catch (err) {
            this.favoritesError = 'Could not load your favorite cryptocurrencies. Please try again.'
            return false
        } finally {
            this.isFavoritesLoading = false
        }
    }
}
export default new UserRequestStore()
import {makeAutoObservable, toJS} from "mobx";
import {GET} from "../requests/request";
import {GET_CRYPTO} from "../../serverRouting/switch";
import {getAuthSession} from "../../helpers/helpersFoo";
import JwtCheckingStore from "../jwtChecking/jwtChecking.store"

class CryptoStore {
    cryptoStore = []
    constructor() {
        makeAutoObservable(this)
    }

    async getCryptoList() {
        try {
            const jwtForFavorites = getAuthSession()
            const {data} = await GET( GET_CRYPTO, jwtForFavorites)
            this.cryptoStore = data?.map(({coin, data}) => ({ id: coin, data: data.price_average }))
            // console.log("response GET favorite list", data)
            return data
        } catch (err) {
            console.log(err)
        }
    }

    async getCryptocurrencyData() {
        try {
            const jwtForFavorites = getAuthSession()
            const {data} = await GET( GET_CRYPTO, jwtForFavorites)
            this.cryptoStore = data?.map(({coin, data}) => ({ id: coin, color: "hsl(257, 70%, 50%)", data: data.price_average }))
            toJS(this.cryptoStore)
            // console.log("We have the response, guys!", data)
            await this.pingMaker()
            if (jwtForFavorites?.jwt) await JwtCheckingStore.addResponseToJwtCheckingStore()
        } catch (err) {
            console.log(err)
        }
    }

    async pingMaker() {
        try {
            if (this.cryptoStore.length) {
                setTimeout( async () => {
                    try {
                        await this.getCryptocurrencyData();
                    } catch (err) {
                        console.log(err)
                    }
                }, 30000)
            } else {
                await this.getCryptocurrencyData();
            }
        } catch (err) {
            console.log(err)
        }
    }
}
export default new CryptoStore()
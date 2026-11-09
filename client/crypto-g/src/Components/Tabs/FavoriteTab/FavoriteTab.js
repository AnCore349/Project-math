import {Card} from "../../common/Card/Card";
import {MyResponsiveBump} from "../../Charts/ChartNivoBamp/Bamp";
import {Surface} from "../../common/Surfaces/OrderingSurface/OrderingSurface";
import React from "react";
import {observer} from "mobx-react-lite";
import UserRequestStore from "../../../store/userRequest/userReques.store"
import CryptoStore from "../../../store/cryptocurrency/crypto.store"
import {Loader} from "../../common/Loader/Loader";

export const FavoriteTab = observer(({tabType}) => {

    const crypto_store = CryptoStore.cryptoStore
    const arr = UserRequestStore.userFavoriteStore
    const favoriteList = crypto_store.filter(({id}) => arr.includes(id))

    if (UserRequestStore.isFavoritesLoading) {
        return <Loader />
    }

    if (UserRequestStore.favoritesError) {
        return <p role="alert">{UserRequestStore.favoritesError}</p>
    }

    if (!UserRequestStore.hasLoadedFavorites || (arr.length > 0 && !crypto_store.length)) {
        return <Loader />
    }

    if (arr.length === 0) {
        return <p role="status">No favorite cryptocurrencies yet. Add some from the market to see them here.</p>
    }

    return (
        <Surface
            wrapping={true}
        >
            {
                    favoriteList.map(({id, data}) => {
                        return (
                            <Card
                                pageType={tabType}
                                cryptoName={id}
                                key={id}
                            >
                                <MyResponsiveBump data={[{id, data}]}/>
                            </Card>
                        )
                    })
            }

        </Surface>
    )

})
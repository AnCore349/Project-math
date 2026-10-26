import {Card} from "../../common/Card/Card";
import {MyResponsiveBump} from "../../Charts/ChartNivoBamp/Bamp";
import {Surface} from "../../common/Surfaces/OrderingSurface/OrderingSurface";
import React from "react";
import {observer} from "mobx-react-lite";
import UserRequestStore from "../../../store/userRequest/userReques.store"
import CryptoStore from "../../../store/cryptocurrency/crypto.store"
import {WrapperLoader} from "../../common/wrapperLoader/WrapperLoader";

export const FavoriteTab = observer(({tabType}) => {

    const crypto_store = CryptoStore.cryptoStore
    const arr = UserRequestStore.userFavoriteStore
    const favoriteList = crypto_store.filter(({id}) => arr.includes(id))

    return (
        <Surface
            wrapping={true}
        >
            <WrapperLoader
                data={favoriteList}
                children={
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
            />

        </Surface>
    )

})
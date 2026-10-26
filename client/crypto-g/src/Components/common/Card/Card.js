import React from "react";
import {observer} from "mobx-react-lite";
import {
    CardCnt,
    CardGraph,
    CryptoName,
    HeaderCard,
    StarContainer,
    CurrensyBox
} from './card.style';
import GlobalStore from "../../../store/GlobalStore/global.store"
import ModalStore from "../../../store/modalWindow/modal.store"
import UserRequestStore from "../../../store/userRequest/userReques.store"
import {structureMenu} from "../../Header/structureMenu";

export const Card = observer(({children, cryptoName, width, pageType, height}) => {

    const arrFavorites = UserRequestStore.userFavoriteStore
    const isLogIn = GlobalStore.globalStorageForAuth.nickName
    const isLogInUser = GlobalStore.globalStorageForAuth
    const favoriteToggle = Boolean(isLogIn && arrFavorites.includes(cryptoName))

    const handleFavoriteOnOff = async () => {
        if (isLogInUser?.nickName) {
            if (!favoriteToggle) await UserRequestStore.setFavoriteCrypto({cryptoName})
            else await UserRequestStore.deleteFavoriteCrypto({cryptoName})
        } else {
            ModalStore.openModal()
        }
    }

    const isEnableStar = () => {
        switch (pageType) {
            case structureMenu.favor:
                return <StarContainer title="Remove from favorite" onClick={handleFavoriteOnOff} favoriteAdd={true} />
            case structureMenu.topChart:
                return null
            default:
            return <StarContainer title="Add to favorite" onClick={handleFavoriteOnOff} favoriteAdd={favoriteToggle} />
        }
    }

    return (
        <CardCnt
            widthCard={width}
        >
            <HeaderCard>
                <CurrensyBox>USD</CurrensyBox>
                <CryptoName>{cryptoName}</CryptoName>
                {isEnableStar()}
            </HeaderCard>
            <CardGraph
                heightCard={height}
            >
                {children}
            </CardGraph>
        </CardCnt>
    )
})
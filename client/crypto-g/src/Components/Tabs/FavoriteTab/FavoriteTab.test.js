import React from 'react';
import {render, screen} from '@testing-library/react';
import {runInAction} from 'mobx';
import {FavoriteTab} from './FavoriteTab';
import UserRequestStore from '../../../store/userRequest/userReques.store';
import CryptoStore from '../../../store/cryptocurrency/crypto.store';

describe('FavoriteTab', () => {
    afterEach(() => {
        runInAction(() => {
            UserRequestStore.userFavoriteStore = [];
            UserRequestStore.hasLoadedFavorites = false;
            UserRequestStore.isFavoritesLoading = false;
            UserRequestStore.favoritesError = '';
            CryptoStore.cryptoStore = [];
        });
    });

    it('shows a helpful message when the user has no favorite cryptocurrencies', () => {
        runInAction(() => {
            UserRequestStore.hasLoadedFavorites = true;
        });

        render(<FavoriteTab tabType="Favorites"/>);

        expect(screen.getByRole('status')).toHaveTextContent(
            'No favorite cryptocurrencies yet. Add some from the market to see them here.',
        );
    });

    it('shows an error instead of an endless loader when favorites cannot be loaded', () => {
        runInAction(() => {
            UserRequestStore.favoritesError = 'Could not load favorites.';
        });

        render(<FavoriteTab tabType="Favorites"/>);

        expect(screen.getByRole('alert')).toHaveTextContent('Could not load favorites.');
    });
});

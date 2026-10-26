import { render, screen } from '@testing-library/react';
import App from './App';
import CryptoStore from '../../store/cryptocurrency/crypto.store';
import JwtCheckingStore from '../../store/jwtChecking/jwtChecking.store';

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders the Crypto-G landing page', () => {
  jest.spyOn(CryptoStore, 'pingMaker').mockResolvedValue();
  JwtCheckingStore.isInitialized = true;
  JwtCheckingStore.isRestoring = false;
  JwtCheckingStore.error = '';
  jest.spyOn(JwtCheckingStore, 'restoreSession').mockResolvedValue();

  render(<App />);

  expect(screen.getByText('Crypto-G')).toBeInTheDocument();
});

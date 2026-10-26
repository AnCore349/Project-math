import { BadGatewayException } from '@nestjs/common';
import { GetCryptoService } from './get-crypto.service';

describe('GetCryptoService', () => {
  let service: GetCryptoService;

  beforeEach(() => {
    service = new GetCryptoService();
  });

  it('builds daily price averages from CoinGecko sparklines', async () => {
    const prices = Array(168).fill(123.45);
    const result = await service.getCryptoData([
      {
        id: 'bitcoin',
        symbol: 'btc',
        image: { thumb: '', small: '', large: '' },
        current_price: 123.45,
        market_cap: 1000,
        sparkline_in_7d: { price: prices },
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].coin).toBe('bitcoin');
    expect(result[0].data.price_average).toHaveLength(7);
    expect(result[0].data.price_average.every(({ y }) => y === 123.45)).toBe(
      true,
    );
    expect(result[0].data.market_cap_average).toEqual([]);
  });

  it('averages partial sparklines over only the available days', async () => {
    const result = await service.getCryptoData([
      {
        id: 'figure-heloc',
        symbol: 'figr_heloc',
        image: { thumb: '', small: '', large: '' },
        current_price: 1,
        market_cap: 1000,
        sparkline_in_7d: { price: Array(140).fill(12.34) },
      },
    ]);

    expect(result[0].data.price_average).toHaveLength(6);
    expect(
      result[0].data.price_average.every(({ y }) => y === 12.34),
    ).toBe(true);
  });

  it('rejects missing 7-day price data', async () => {
    await expect(
      service.getCryptoData([
        {
          id: 'bitcoin',
          symbol: 'btc',
          image: { thumb: '', small: '', large: '' },
          current_price: 123.45,
          market_cap: 1000,
          sparkline_in_7d: { price: [] },
        },
      ]),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});

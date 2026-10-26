import { BadGatewayException, Injectable } from '@nestjs/common';
import {
  ICurrencyCalculation,
  IGeckoResponce,
  IParseData,
} from '../common/interfaces';
import { parsData } from '../common/helpers/parsData';
import { weekAverager } from '../common/helpers/weekAverager';
import * as https from 'https';

const CoinGecko = require('coingecko-api');

type CoinGeckoRequestOptionsBuilder = {
  _buildRequestOptions(path: string, params?: object): https.RequestOptions;
};

@Injectable()
export class GetCryptoService {
  geckoApiReq;
  constructor() {
    this.geckoApiReq = new CoinGecko();
    const client = this.geckoApiReq as CoinGeckoRequestOptionsBuilder;
    const buildRequestOptions = client._buildRequestOptions.bind(this.geckoApiReq);
    client._buildRequestOptions = (path, params) => ({
      ...buildRequestOptions(path, params),
      headers: {
        'User-Agent': 'crypto-graph/1.0',
      },
    });
  }
  async getCoinsList(): Promise<IGeckoResponce> {
    try {
      const response = await this.geckoApiReq.coins.markets({
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 15,
        page: 1,
        sparkline: true,
      });
      if (!response.success || !Array.isArray(response.data)) {
        throw new BadGatewayException(
          `CoinGecko market data request failed with status ${response.code}`,
        );
      }
      return response;
    } catch (err) {
      if (err instanceof BadGatewayException) throw err;
      throw new BadGatewayException('CoinGecko market data request failed');
    }
  }

  async getCryptoData(
    cryptoListData: IParseData[],
  ): Promise<ICurrencyCalculation[]> {
    try {
      const clearData = parsData(cryptoListData);
      return clearData.map(({ id, sparkline_in_7d }) => {
        const prices = sparkline_in_7d?.price;
        if (!Array.isArray(prices) || prices.length === 0) {
          throw new BadGatewayException(
            `CoinGecko returned no 7-day price data for ${id}`,
          );
        }
        return {
          coin: id,
          success: true,
          message: 'OK',
          code: 200,
          data: {
            price_average: weekAverager(
              prices.map(
                (price, index): [number, number] => [index, price],
              ),
            ),
            market_cap_average: [],
          },
        };
      });
    } catch (err) {
      if (err instanceof BadGatewayException) throw err;
      throw new BadGatewayException('CoinGecko price data could not be processed');
    }
  }
}

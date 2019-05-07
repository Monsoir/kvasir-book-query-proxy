import * as axios from 'axios';
import { IBook } from '$src/books/interfaces/book.interface';
import { QueriedBookKeyMap } from '../constants';
import { IBookProxiable } from '$src/proxy/proxy.provider';

const AliyunAddress = 'https://isbn.market.alicloudapi.com/ISBN';

export class BookProxyToAliyun implements IBookProxiable {
  constructor(
    private readonly secret: string,
  ) {}

  restructure = (data: any): IBook => {
    const keyMap: QueriedBookKeyMap = {
      isbn: data.isbn13 || '',
      isbn10: data.isbn10 || '',

      title: data.title || '',
      originTitle: data.origin_title || '',

      author: data.author || '',
      translator: '',
      publisher: data.publisher || '',
      publishDate: data.pubdate || '',

      binding: data.binding || '',
      paper: '',
      pages: parseInt(data.pages, 10) || 0,
      format: '',
      price: data.price || '',

      summary: data.summary || '',

      imagesMedium: data.images_medium || '',
      imagesLarge: data.images_large || '',
    };

    const result = {};
    Object.keys(keyMap).forEach((ele) => {
      result[ele] = keyMap[ele];
    });
    return result as IBook;
  }

  queryBookByISBN = async (isbn: string): Promise<IBook> => {
    const result = await axios.default.get(`${AliyunAddress}?is_info=0&isbn=${isbn}`, {
      headers: {
        Authorization: `APPCODE ${this.secret}`,
      },
    });
    if (result.data.error_code !== 0) {
      throw new Error(result.data.reason);
    } else {
      return this.restructure(result.data.result);
    }
  }
}

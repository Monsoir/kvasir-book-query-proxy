import { Injectable } from '@nestjs/common';
import { IBook } from '$src/books/interfaces/book.interface';
import { BookQueryProxySource } from '$src/miscellaneous/constants';
import { BookProxyToAliyun } from '$src/miscellaneous/proxies/impls/aliyun.book.proxy';
import { ConfigService } from '$src/config/config.service';

export interface IBookProxiable {
  restructure: (data: any) => IBook;
  queryBookByISBN: (isbn: string) => Promise<IBook>;
}

@Injectable()
export class BookProxy {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  getBook = async (isbn: string, type: BookQueryProxySource): Promise<{success: boolean, book: IBook, messages?: string}> => {
    const proxy = this.proxyFor(type);
    if (!proxy) { return { success: false, book: null, messages: '没找到对应类型代理' }; }

    try {
      const book = await proxy.queryBookByISBN(isbn);
      return { success: true, book };
    } catch (e) {
      return { success: false, book: null, messages: e.message };
    }
  }

  private proxyFor = (type: BookQueryProxySource): IBookProxiable => {
    switch (type) {
      case BookQueryProxySource.aliyun: return new BookProxyToAliyun(this.configService.get('ALIYUN_APPCODE') as string);
      default: return null;
    }
  }
}

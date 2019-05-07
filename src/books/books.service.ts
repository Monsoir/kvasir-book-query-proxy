import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Book, IBook } from './interfaces/book.interface';
import { BookModelToken } from './schemas/book.schema';
import { BookQueryProxySource, ProviderToken } from '$src/miscellaneous/constants';
import { Proxy } from '$src/proxy/proxy.provider';

interface IQueryResult {
  success: boolean;
  book: Book;
  messages?: string;
}

interface IQuerySetResult {
  success: boolean;
  books: Book[];
  messages?: string;
}

@Injectable()
export class BooksService {
  constructor(
    @Inject(BookModelToken)
    private readonly bookModel: Model<Book>,

    @Inject(ProviderToken.validation)
    private readonly validator: ValidatorJS.ValidatorStatic,

    @Inject(Proxy)
    private readonly proxy: Proxy,
  ) {}

  queryByISBN = async (isbn: string): Promise<{ success: boolean, book: Book, cached: boolean, messages?: string }> => {
    // 检验 isbn 的合法性
    if (!this.validator.isISBN(isbn)) {
      throw new BadRequestException('ISBN 不符合规则');
    }

    // 先查找本地
    const localQueryResult = await this.queryLocal(isbn);
    if (localQueryResult.success && localQueryResult.book) {
      return { success: true, book: localQueryResult.book, cached: true };
    }

    // 本地没有，调用 API
    const remoteQueryResult = await this.queryRemote(isbn);
    if (remoteQueryResult.success) {
      return { success: true, book: remoteQueryResult.book, cached: false };
    }

    return { success: false, book: null, cached: false, messages: remoteQueryResult.messages };
  }

  findAll = async (): Promise<IQuerySetResult> => {
    try {
      const books = await this.bookModel.find().exec();
      return {
        success: true,
        books,
      };
    } catch (e) {
      return {
        success: false,
        books: [],
        messages: e.message,
      };
    }
  }

  private create = async (dto: IBook): Promise<IQueryResult> => {
    const createdBook = new this.bookModel(dto);
    try {
      const savedBook = await createdBook.save();
      return {
        success: true,
        book: savedBook,
      };
    } catch {
      return {
        success: false,
        book: null,
      };
    }
  }

  private queryLocal = async (isbn: string): Promise<IQueryResult> => {
    try {
      const foundBook = await (isbn.length === 13 ? this.bookModel.findOne({ isbn }) : this.bookModel.findOne({ isbn10: isbn }));
      return { success: true, book: foundBook };
    } catch {
      return { success: false, book: null };
    }
  }

  private queryRemote = async (isbn: string): Promise<IQueryResult> => {
    // 调用 API 查询
    const queryResult = await this.proxy.getBook(isbn, BookQueryProxySource.aliyun);
    if (!queryResult.success) {
      return { success: false, book: null, messages: queryResult.messages };
    }

    // 查询结果存储
    try {
      const savedResult = await this.create(queryResult.book);
      if (savedResult.success) {
        return { success: true, book: savedResult.book };
      }
      return { success: false, book: null };
    } catch (e) {
      return { success: false, book: null, messages: e.message || '' };
    }
  }
}

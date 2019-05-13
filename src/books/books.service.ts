import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Book, IBook, ICachedBook } from './interfaces/book.interface';
import { BookModelToken } from './schemas/book.schema';
import { BookQueryProxySource, ProviderToken } from '$src/miscellaneous/constants';
import { Proxy } from '$src/proxy/proxy.provider';
import { CacheService } from '$src/cache/cache.service';
import { plainToClass } from 'class-transformer';
import { QueriedCacheBook } from './miscellaneous/dtos';

interface IQueryResult {
  success: boolean;
  book: Book;
  messages?: string;
}

interface IQuerySetResult {
  success: boolean;
  books: ICachedBook[];
  messages?: string;
  total: number;
  pageIndex: number;
}

const PAGE_SIZE = 10;
const createVisitedCacheKey = (key: string) => `visited-${key}`;
const createProxiedCacheKey = (key: string) => `proxied-${key}`;

@Injectable()
export class BooksService {
  constructor(
    @Inject(BookModelToken)
    private readonly bookModel: Model<Book>,

    @Inject(ProviderToken.validation)
    private readonly validator: ValidatorJS.ValidatorStatic,

    @Inject(Proxy)
    private readonly proxy: Proxy,

    @Inject(CacheService)
    private readonly redisCache: CacheService,
  ) {}

  queryByISBN = async (isbn: string): Promise<{ success: boolean, book: Book, cached: boolean, messages?: string }> => {
    // 检验 isbn 的合法性
    if (!this.validator.isISBN(isbn)) {
      throw new BadRequestException('ISBN 不符合规则');
    }

    // 先查找本地
    const localQueryResult = await this.queryLocal(isbn);
    if (localQueryResult.success && localQueryResult.book) {
      await this.recordOperatedTimes(isbn);
      return { success: true, book: localQueryResult.book, cached: true };
    }

    // 本地没有，调用 API
    const remoteQueryResult = await this.queryRemote(isbn);
    if (remoteQueryResult.success) {
      await this.recordOperatedTimes(isbn, true);
      return { success: true, book: remoteQueryResult.book, cached: false };
    }

    return { success: false, book: null, cached: false, messages: remoteQueryResult.messages };
  }

  findCacheds = async (page: number): Promise<IQuerySetResult> => {
    if (!this.validator.isInt(page.toString()) || page <= 0) {
      throw new BadRequestException('页码参数错误');
    }

    try {
      // TODO: 根据创建时间进行分页
      const rawBooks = await this.bookModel.find().skip(PAGE_SIZE * (page - 1)).limit(PAGE_SIZE).exec();
      const total = await this.bookModel.find().estimatedDocumentCount();

      const books = plainToClass(QueriedCacheBook, rawBooks.map(ele => ele.toObject()), {
        excludePrefixes: ['_'],
      });

      const times = await this.batchReadOperatedTimes(books.map(ele => ele.isbn));
      books.forEach((ele, index) => {
        ele.visited = times[index].visited;
        ele.proxied = times[index].proxied;
      });

      return {
        success: true,
        books,
        pageIndex: page,
        total,
      };
    } catch (e) {
      return {
        success: false,
        books: [],
        messages: e.message,
        pageIndex: page,
        total: 0,
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

  /**
   * 记录某个书籍的相关的访问次数
   */
  private recordOperatedTimes = async (isbn: string, didProxy: boolean = false) => {
    const keys = [createVisitedCacheKey(isbn)];

    if (didProxy) {
      keys.push(createProxiedCacheKey(isbn));
    }

    try {
      await this.redisCache.multiIncr(...keys);
    } catch (e) {
      console.log(e);
    }
  }

  private readOperatedTimes = async (isbn: string): Promise<{visited: number, proxied: number}> => {
    const visitedKey = createVisitedCacheKey(isbn);
    const proxiedKey = createProxiedCacheKey(isbn);

    const [ visitedTimes, proxiedTimes, _ ] = await this.redisCache.mget(visitedKey, proxiedKey);
    return {
      visited: parseInt(visitedTimes, 10) || 0,
      proxied: parseInt(proxiedTimes, 10) || 0,
    };
  }

  private batchReadOperatedTimes = async (isbns: string[]): Promise<Array<{visited: number, proxied: number}> | null> => {
    const visitedKeys = [];
    const proxiedKeys = [];
    isbns.forEach(ele => {
      visitedKeys.push(createVisitedCacheKey(ele));
      proxiedKeys.push(createProxiedCacheKey(ele));
    });

    try {
      const times = await this.redisCache.mget(...visitedKeys, ...proxiedKeys);

      const pivot = times.length / 2;
      // const visitedTimes = times.slice(0, pivot);
      // const proxiedTimes = times.slice(pivot, times.length);

      const results = [];
      for (let i = 0; i < pivot; i++) {
        results.push({
          visited: parseInt(times[i], 10) || 0,
          proxied: parseInt(times[i + pivot], 10) || 0,
        });
      }
      return results;
    } catch {
      return null;
    }
  }
}

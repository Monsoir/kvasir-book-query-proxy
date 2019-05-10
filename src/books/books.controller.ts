import { Controller, Get, Query, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { QueriedBookResDto, QueriedCachedBookListDto, QueriedBook } from './miscellaneous/dtos';
import { BooksService } from './books.service';
import { plainToClass } from 'class-transformer';

@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
  ) {}

  @Get('query')
  @UseInterceptors(ClassSerializerInterceptor)
  async readABookBy(@Query('isbn') isbn: string) {
    const result = await this.booksService.queryByISBN(isbn);
    if (result.success) {
      const response = new QueriedBookResDto(true, '', plainToClass(QueriedBook, result.book.toObject(), {
        excludePrefixes: ['_'],
      }));
      response.isCached = result.cached;
      return response;
    }
    return new QueriedBookResDto(false, result.messages || '查询失败', {});
  }

  @Get('query/cached')
  async queryAllCache() {
    const result = await this.booksService.findAll();
    if (result.success) {
      const response = new QueriedCachedBookListDto(true, '', plainToClass(QueriedBook, result.books.map(ele => ele.toObject()), {
        excludePrefixes: ['_'],
      }));
      response.isCached = true;
      return response;
    }
    return new QueriedCachedBookListDto(false, `查询失败：${result.messages || ''}`, []);
  }
}

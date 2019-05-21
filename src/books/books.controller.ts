import { Controller, Get, Query, UseInterceptors, ClassSerializerInterceptor, UseGuards } from '@nestjs/common';
import { QueriedBookResDto, QueriedCachedBookListDto, QueriedBook } from './miscellaneous/dtos';
import { BooksService } from './books.service';
import { plainToClass } from 'class-transformer';
import { AuthGuard } from '$src/miscellaneous/guards/auth.guard';

@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
  ) {}

  @UseGuards(AuthGuard)
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
  async queryCached(@Query('p') page: number) {
    const result = await this.booksService.findCacheds(page || 1);
    if (result.success) {
      const response = new QueriedCachedBookListDto(true, '', plainToClass(QueriedBook, result.books));
      response.isCached = true;
      response.pageIndex = result.pageIndex;
      response.total = result.total;
      return response;
    }
    return new QueriedCachedBookListDto(false, `查询失败：${result.messages || ''}`, []);
  }
}

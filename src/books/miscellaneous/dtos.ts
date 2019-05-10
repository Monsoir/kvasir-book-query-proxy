import { Response } from '$src/miscellaneous/formats/response.format';
import { IBook } from '../interfaces/book.interface';

export class QueriedBook implements IBook {
  isbn: string;
  isbn10: string;
  title: string;
  originTitle: string;
  author: string;
  translator: string;
  publisher: string;
  publishDate: string;
  binding: string;
  paper: string;
  pages: number;
  format: string;
  price: string;
  summary: string;
  imagesMedium: string;
  imagesLarge: string;
}

export class QueriedBookResDto extends Response<IBook> {
  isCached: boolean = false;
}

export class QueriedCachedBookListDto extends Response<IBook> {
  isCached: boolean = false;
  pageIndex: number;
  total: number;
}

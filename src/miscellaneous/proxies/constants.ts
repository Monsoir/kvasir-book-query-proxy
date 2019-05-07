import { IBook } from '$src/books/interfaces/book.interface';

export type QueriedBookKeyMap = {
  [P in keyof IBook]: string | number;
};

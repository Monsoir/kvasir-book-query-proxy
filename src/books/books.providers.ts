import { Connection } from 'mongoose';
import { BookSchema, BookModelToken } from './schemas/book.schema';
import { ProviderToken } from '$src/miscellaneous/constants';

export const BooksProviders = [
  {
    provide: BookModelToken,
    useFactory: (connection: Connection) => connection.model('book', BookSchema),
    inject: [ProviderToken.mongoDBConnection],
  },
];

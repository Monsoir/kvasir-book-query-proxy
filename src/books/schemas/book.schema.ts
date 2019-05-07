import * as mongoose from 'mongoose';

export const BookSchema = new mongoose.Schema({
  isbn: String,
  isbn10: String,

  title: String,
  originTitle: String,

  author: String,
  translator: String,
  publisher: String,
  publisherDate: String,

  binding: String,
  paper: String,
  pages: Number,
  format: String,
  price: String,

  summary: String,

  imagesMedium: String,
  imagesLarge: String,
});

export const BookModelToken = 'BookModelToken';

import { Document } from 'mongoose';

export interface IBook {
  isbn: string; // 13 位 ISBN
  isbn10: string; // 10 位 ISBN

  title: string;
  originTitle: string;

  author: string;
  translator: string;
  publisher: string;
  publishDate: string;

  binding: string; // 装订形式：精装，平装
  paper: string; // 纸张材料：胶版纸
  pages: number;
  format: string; // 32 开
  price: string; // 价格

  summary: string; // 内容简介

  imagesMedium: string; // 用 , 分割
  imagesLarge: string;
}

export interface ICachedBook extends IBook {
  visited: number;
  proxied: number;
}

export interface Book extends Document {
  readonly isbn: string; // 13 位 ISBN
  readonly isbn10: string; // 10 位 ISBN

  readonly title: string;
  readonly originTitle: string;

  readonly author: string;
  readonly translator: string;
  readonly publisher: string;
  readonly publishDate: string;

  readonly binding: string; // 装订形式：精装，平装
  readonly paper: string; // 纸张材料：胶版纸
  readonly pages: number;
  readonly format: string; // 32 开
  readonly price: string; // 价格

  readonly summary: string; // 内容简介

  readonly imagesMedium: string; // 用 , 分割
  readonly imagesLarge: string;
}

export class Response<T> {
  constructor(
    protected readonly success = false,
    protected readonly message = '',
    private data: T | any = {},
  ) {}

  putData = (data: T) => {
    this.data = data;
  }
}

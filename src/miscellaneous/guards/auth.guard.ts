import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as crypto from 'crypto';
import * as moment from 'moment';
import { ConfigService } from '$src/config/config.service';

const AuthorizationTimeout = 60; // 60s for timeout

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // 检验签名信息字段是否为空

    // 头部包含 hash, timeStamp
    // hash 内容： (queryString + timeStamp + appSecret).md5.base64
    const authorization = request.headers.authorization; // hash
    const timestamp = request.headers.timestamp;
    if (!authorization || !timestamp) {
      return false;
    }

    // 检验时间戳是否超时
    const clientMoment = moment(timestamp);
    const nowMoment = moment();
    // const nowMoment = moment().add(moment.duration(AuthorizationTimeout + 10, 'seconds'));
    const diff = nowMoment.diff(clientMoment, 'seconds');
    if (diff > AuthorizationTimeout) {
      // 超时 60s 失效
      return false;
    }

    // 检验签名是否一致
    const queryString = Object.keys(request.query).sort().map(ele => `${ele}=${request.query[ele]}`).join('&');
    const data = this.createHashData(queryString, timestamp, this.configService.get('APP_SECRET'));
    const hashCreatedByServer = crypto.createHash('md5').update(data).digest('base64');
    return hashCreatedByServer === authorization;
  }

  private createHashData(...args: any[]): string {
    return args.join('-');
  }
}

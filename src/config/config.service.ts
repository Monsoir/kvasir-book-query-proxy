import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as joi from 'joi';
import * as dotenv from 'dotenv';

export interface IEnvConfig {
  [key: string]: string;
}

@Injectable()
export class ConfigService {
  private readonly envConfig: IEnvConfig;

  constructor(configFilePath: string) {
    const config = dotenv.parse(fs.readFileSync(configFilePath));
    this.envConfig = this.validateInput(config);
  }

  get(key: string): string | number {
    return this.envConfig[key];
  }

  private validateInput(envConfig: IEnvConfig): IEnvConfig {
    const envVarsSchema: joi.ObjectSchema = joi.object({
      // App
      NODE_ENV: joi.string()
        .valid(['development', 'production', 'test'])
        .default('development'),
      PORT: joi.number().default(3000),
      APP_SECRET: joi.string().required(),

      // Mongodb
      MONGO_HOST: joi.string().ip().required(),
      MONGO_USER: joi.string().required(),
      MONGO_PASSWORD: joi.string().required(),
      MONGO_PORT: joi.number().port().required(),
      MONGO_NAME: joi.string().required(),

      // Redis
      REDIS_HOST: joi.string().ip().required(),
      REDIS_PORT: joi.number().required(),
      REDIS_PASSWORD: joi.string().required(),
      REDIS_TOKEN_TTL: joi.number().required(),

      // ALIYUN
      ALIYUN_APPCODE: joi.string().required(),

      // Tencent Cloud
      TENCENT_SECRET_ID: joi.string().required(),
      TENCENT_SECRET_KEY: joi.string().required(),
    });
    const { error, value } = joi.validate(
      envConfig,
      envVarsSchema,
    );
    if (error) {
      throw new Error(`配置出错： ${error.message}`);
    }
    return value;
  }
}

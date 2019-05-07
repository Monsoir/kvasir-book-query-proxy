import * as mongoose from 'mongoose';
import { Module } from '@nestjs/common';
import { ConfigService } from '$src/config/config.service';
import { ProviderToken } from '$src/miscellaneous/constants';

const MongoFactory = {
  provide: ProviderToken.mongoDBConnection,
  useFactory: async (config: ConfigService): Promise<typeof mongoose> => (
    // mongodb://user:passwd@host:port/database
    await mongoose.connect(`mongodb://${config.get('MONGO_USER')}:${config.get('MONGO_PASSWORD')}@${config.get('MONGO_HOST')}:${config.get('MONGO_PORT')}/${config.get('MONGO_NAME')}`, {
      useNewUrlParser: true,
    })
  ),
  inject: [ConfigService],
};

@Module({
  providers: [
    MongoFactory,
  ],
  exports: [ProviderToken.mongoDBConnection],
})
export class MongoModule {}

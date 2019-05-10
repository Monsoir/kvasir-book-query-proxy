import { Module } from '@nestjs/common';
// import { getConnectionOptions } from 'typeorm';
// import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { BooksModule } from './books/books.module';
import { DiagnosticModule } from './diagnostic/diagnostic.module';

// const CreateTypeOrmConfig = async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
//   const connectionOptions = await getConnectionOptions();
//   Object.assign(connectionOptions, {
//     name: configService.get('databaseConnectionName'),
//     host: configService.get('DATABASE_HOST'),
//     port: parseInt(configService.get('DATABASE_PORT') as string, 10),
//     username: configService.get('DATABASE_USER'),
//     password: configService.get('DATABASE_PASSWORD'),
//     database: configService.get('DATABASE_NAME'),
//   });
//   return connectionOptions;
// };

@Module({
  imports: [
    ConfigModule,
    BooksModule,
    DiagnosticModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

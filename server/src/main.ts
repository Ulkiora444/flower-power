import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

// const httpsOptions = {
//   key: fs.readFileSync('./public/ssl/localhost.pem'),
//   cert: fs.readFileSync('./public/ssl/cert.pem'),
// };

async function bootstrap() {
  const app = await NestFactory.create(AppModule); //, {httpsOptions,}
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}
bootstrap();

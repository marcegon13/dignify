import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. CORS: Permite que la Web (puerto 3000) se comunique con la API
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. PREFIJO GLOBAL: Todas las rutas de lógica empiezan con /api
  app.setGlobalPrefix('api');

  // 3. ASSETS ESTÁTICOS: Servir música desde la carpeta 'tracks' 
  // Usamos __dirname para asegurar que encuentre la carpeta relativa a src
  app.useStaticAssets(join(__dirname, '..', 'tracks'), {
    prefix: '/uploads/',
  });

  // 4. AUDITORÍA: Registro de actividad de la API
  app.useGlobalInterceptors(new LoggingInterceptor());

  // 5. VALIDACIÓN: Seguridad en los datos de entrada
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 6. FILTRO DE ERRORES: Respuestas estandarizadas para el frontend
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  // 7. PUERTO: Ejecución en el 3001 para desarrollo local
  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');

  logger.log(`[DignifyAPI] Funcionando en: http://localhost:${port}`);
  logger.log(`[DignifyAPI] Audios servidos desde: /uploads/ (mapeado a carpeta tracks)`);
}
bootstrap();
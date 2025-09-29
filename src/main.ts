import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import compression from 'compression'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable CORS for frontend access
  app.enableCors()

  // Enable GZIP compression
  app.use(compression())

  await app.listen(3000)
  console.log(`Application is running on: ${await app.getUrl()}`)
}

void bootstrap()

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Medical API')
  .setDescription('API for Medical System Testbed')
  .setVersion('1.0')
  .addTag('patients')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);

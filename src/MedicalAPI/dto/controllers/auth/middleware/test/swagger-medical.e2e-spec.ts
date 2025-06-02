import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Medical API Documentation (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should display Swagger documentation with HIPAA notices', () => {
    return request(app.getHttpServer())
      .get('/api/docs')
      .expect(200)
      .expect((res) => {
        expect(res.text).toContain('HIPAA-COMPLIANT MEDICAL API');
        expect(res.text).toContain('Protected Health Information');
        expect(res.text).toContain('HL7 FHIR R4');
      });
  });

  it('should require authentication for patient endpoints', () => {
    return request(app.getHttpServer())
      .get('/patients')
      .expect(401);
  });

  afterAll(async () => {
    await app.close();
  });
});

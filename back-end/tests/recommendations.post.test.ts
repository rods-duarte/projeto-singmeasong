import supertest from 'supertest';
import { prisma } from '../src/database.js';
import app from '../src/app.js';
import recommendationFactory from './factories/recommendationFactory.js';
import scenarioFactory from './factories/scenarioFactory.js';

beforeEach(() => {
  scenarioFactory.clearRecommendations();
});

describe('create music recommendation tests', () => {
  it('missing name string should not create, expect 422', async () => {
    const recommendationData =
      recommendationFactory.createRecommendationData('');

    const response = await supertest(app)
      .post('/recommendations')
      .send(recommendationData);
    expect(response.status).toBe(422);

    const recommendationCreated = await prisma.recommendation.findFirst({
      where: recommendationData,
    });
    expect(recommendationCreated).toBe(null);
  });

  it('missing youtube link string should not create, expect 422', async () => {
    const recommendationData = recommendationFactory.createRecommendationData(
      undefined,
      ''
    );

    const response = await supertest(app)
      .post('/recommendations')
      .send(recommendationData);
    expect(response.status).toBe(422);

    const recommendationCreated = await prisma.recommendation.findFirst({
      where: recommendationData,
    });
    expect(recommendationCreated).toBe(null);
  });

  it('given a non youtube link should not create, expect 422', async () => {
    const recommendationData = recommendationFactory.createRecommendationData(
      undefined,
      'https://link.com'
    );
    const response = await supertest(app)
      .post('/recommendations')
      .send(recommendationData);
    expect(response.status).toBe(422);

    const recommendationCreated = await prisma.recommendation.findFirst({
      where: recommendationData,
    });
    expect(recommendationCreated).toBe(null);
  });

  it('given valid body should create recommendation, expect 201', async () => {
    const recommendationData = recommendationFactory.createRecommendationData();

    const response = await supertest(app)
      .post('/recommendations')
      .send(recommendationData);
    expect(response.status).toBe(201);

    const recommendationCreated = await prisma.recommendation.findFirst({
      where: recommendationData,
    });
    expect(recommendationCreated.name).toBe(recommendationData.name);
    expect(recommendationCreated.youtubeLink).toBe(
      recommendationData.youtubeLink
    );
  });

  it('given name in use should not create, expect 409', async () => {
    const recommendationData =
      recommendationFactory.createRecommendationData('name');
    await recommendationFactory.createRecommendation(recommendationData);

    const response = await supertest(app)
      .post('/recommendations')
      .send(recommendationData);
    expect(response.status).toBe(409);

    const recommendationCreated = await prisma.recommendation.findMany({
      where: { name: recommendationData.name },
    });
    expect(recommendationCreated.length).toBe(1);
  });
});

afterAll(() => {
  scenarioFactory.clearRecommendations();
});

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
    expect(recommendationCreated.score).toBe(0);
  });
});

describe('upvoting recommendation tests', () => {
  it('given a non existing recommendation id should return error, expect 404', async () => {
    const response = await supertest(app).post('/recommendations/0/upvote');
    expect(response.status).toBe(404);
  });

  it('given a invalid recommendation id should return error, expect 422', async () => {
    const response = await supertest(app).post(
      '/recommendations/invalid/upvote'
    );
    expect(response.status).toBe(422);
  });

  it('given a valid recommendation id should upvote, expect 200', async () => {
    const recommendation = await recommendationFactory.createRecommendation();

    const response = await supertest(app).post(
      `/recommendations/${recommendation.id}/upvote`
    );
    expect(response.status).toBe(200);

    const recommendationUpvoted = await prisma.recommendation.findFirst({
      where: { id: recommendation.id },
    });
    expect(recommendationUpvoted.score).toBe(1);
  });
});

afterAll(() => {
  scenarioFactory.clearRecommendations();
});

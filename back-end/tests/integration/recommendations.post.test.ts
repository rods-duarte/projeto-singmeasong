import supertest from 'supertest';
import { faker } from '@faker-js/faker';
import { prisma } from '../../src/database.js';
import app from '../../src/app.js';
import recommendationFactory from '../factories/recommendationFactory.js';
import scenario from '../factories/scenarioFactory.js';

beforeEach(async () => {
  await scenario.clearRecommendations();
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
    expect(recommendationCreated).toBeNull();
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
    expect(recommendationCreated).toBeNull();
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
    expect(recommendationCreated).toBeNull();
  });

  it('given name in use should not create, expect 409', async () => {
    const recommendationData = recommendationFactory.createRecommendationData(
      faker.music.songName()
    );
    await recommendationFactory.createRecommendation(recommendationData.name);

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

  it('given a valid recommendation id should upvote, expect 200', async () => {
    const recommendation = await recommendationFactory.createRecommendation();

    const response = await supertest(app).post(
      `/recommendations/${recommendation.id}/upvote`
    );
    expect(response.status).toBe(200);

    const recommendationUpvoted = await prisma.recommendation.findFirst({
      where: { id: recommendation.id },
    });
    expect(recommendationUpvoted.score).toBe(recommendation.score + 1);
  });
});

describe('downvoting recommendation tests', () => {
  it('given a non existing recommendation id should return error, expect 404', async () => {
    const response = await supertest(app).post('/recommendations/0/downvote');
    expect(response.status).toBe(404);
  });

  it('given a valid recommendation id should downvote, expect 200', async () => {
    const recommendation = await recommendationFactory.createRecommendation();

    const response = await supertest(app).post(
      `/recommendations/${recommendation.id}/downvote`
    );
    expect(response.status).toBe(200);

    const recommendationUpvoted = await prisma.recommendation.findFirst({
      where: { id: recommendation.id },
    });
    expect(recommendationUpvoted.score).toBe(recommendation.score - 1);
  });

  it('given a recommendation with -5 score should delete, expect 200', async () => {
    const recommendation = await recommendationFactory.createRecommendation();
    await recommendationFactory.updateScore(-5, recommendation.id);

    const response = await supertest(app).post(
      `/recommendations/${recommendation.id}/downvote`
    );
    expect(response.status).toBe(200);

    const recommendationDeleted = await prisma.recommendation.findFirst({
      where: { id: recommendation.id },
    });
    expect(recommendationDeleted).toBeNull();
  });
});

afterAll(async () => {
  await scenario.clearRecommendations();
});

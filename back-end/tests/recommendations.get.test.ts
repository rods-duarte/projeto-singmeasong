import supertest from 'supertest';
import scenario from './factories/scenarioFactory';
import app from '../src/app.js';
import recommendationFactory from './factories/recommendationFactory';
import { prisma } from '../src/database.js';

beforeEach(async () => {
  await scenario.clearRecommendations();
});

describe('get music recommendations tests', () => {
  it('should return 10 recommendations, expect 200', async () => {
    await recommendationFactory.createManyRecommendations(11);

    const response = await supertest(app).get('/recommendations');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(10);
    expect(response.body[0].id).not.toBe(null);
    expect(response.body[0].name).not.toBe(null);
    expect(response.body[0].youtubeLink).not.toBe(null);
    expect(response.body[0].score).not.toBe(null);
  });

  it('should return all recommendations, expect 200', async () => {
    const num = Math.ceil(Math.random() * 10);
    await recommendationFactory.createManyRecommendations(num);

    const response = await supertest(app).get('/recommendations');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(num);
  });
});

describe('get music recommendation by id tests', () => {
  it('given valid id should return recommendation, expect 200', async () => {
    const recommendation = await recommendationFactory.createRecommendation();

    const response = await supertest(app).get(
      `/recommendations/${recommendation.id}`
    );
    const { id, name, youtubeLink, score } = response.body;
    expect(response.status).toBe(200);
    expect(id).toBe(recommendation.id);
    expect(name).toBe(recommendation.name);
    expect(youtubeLink).toBe(recommendation.youtubeLink);
    expect(score).toBe(recommendation.score);
  });

  it('given invalid id should error, expect 404', async () => {
    const response = await supertest(app).get('/recommendations/0');
    const { id, name, youtubeLink, score } = response.body;
    expect(response.status).toBe(404);
    expect(id).toBe(undefined);
    expect(name).toBe(undefined);
    expect(youtubeLink).toBe(undefined);
    expect(score).toBe(undefined);
  });
});

describe('get a random music recommendation', () => {
  it('given several requests should return a music reccomendation with 10+ upvotes ~ 70% of the time, expect 200', async () => {
    await scenario.withThreeRecommendationsAndDifferentScores(-5, 0, 15);

    const total = 100;
    let scoreHigherThan10 = 0;
    for (let i = 0; i < total; i++) {
      const response = await supertest(app).get('/recommendations/random');
      expect(response.status).toBe(200);
      if (response.body.score > 10) scoreHigherThan10++;
    }

    expect(scoreHigherThan10).toBeGreaterThanOrEqual(65);
    expect(scoreHigherThan10).toBeLessThanOrEqual(75);
  });

  it('given no recommendation registered should return nothing, expect 404', async () => {
    const response = await supertest(app).get('/recommendations/random');
    const { id, name, youtubeLink, score } = response.body;
    expect(response.status).toBe(404);
    expect(id).toBe(undefined);
    expect(name).toBe(undefined);
    expect(youtubeLink).toBe(undefined);
    expect(score).toBe(undefined);
  });

  it('should return a music recommendation, expect 200', async () => {
    await scenario.withThreeRecommendationsAndDifferentScores(15, 200, 105);
    const response = await supertest(app).get('/recommendations/random');
    const { id, name, youtubeLink, score } = response.body;
    expect(response.status).toBe(200);
    expect(id).not.toBe(undefined);
    expect(name).not.toBe(undefined);
    expect(youtubeLink).not.toBe(undefined);
    expect(score).not.toBe(undefined);
  });
});

afterAll(async () => {
  await scenario.clearRecommendations();
});

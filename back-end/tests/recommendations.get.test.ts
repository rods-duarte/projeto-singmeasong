import supertest from 'supertest';
import scenario from './factories/scenarioFactory';
import app from '../src/app.js';
import recommendationFactory from './factories/recommendationFactory';
// import { prisma } from '../src/database.js';

beforeEach(async () => {
  await scenario.clearRecommendations();
});

describe('get music recommendations tests', () => {
  it('should return 10 recommendations, expect 200', async () => {
    await scenario.withRecommendationsCreated(11);

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
    await scenario.withRecommendationsCreated(num);

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

afterAll(async () => {
  await scenario.clearRecommendations();
});

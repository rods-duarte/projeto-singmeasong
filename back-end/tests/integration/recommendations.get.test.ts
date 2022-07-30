import supertest from 'supertest';
import scenario from '../factories/scenarioFactory';
import app from '../../src/app.js';
import recommendationFactory from '../factories/recommendationFactory';
import { prisma } from '../../src/database.js';
import { getRandomNumber, isRecommendationsSortedByOrder } from '../testUtils';

beforeEach(async () => {
  await scenario.clearRecommendations();
});

describe('get music recommendations tests', () => {
  it('should return 10 recommendations, expect 200', async () => {
    await recommendationFactory.createManyRecommendations(11);

    const response = await supertest(app).get('/recommendations');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(10);
    expect(response.body[0].id).not.toBeNull();
    expect(response.body[0].name).not.toBeNull();
    expect(response.body[0].youtubeLink).not.toBeNull();
    expect(response.body[0].score).not.toBeNull();
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
    expect(response.status).toBe(404);
    expect(Object.keys(response.body).length).toBe(0);
  });
});

describe('get a random music recommendation tests', () => {
  // ? acho que nao faz tanto sentido esse teste mas como deu um certo trabalho nao quero apagar 😔
  it('given several requests should return a music reccomendation with 10+ upvotes ~ 70% of the time, expect 200', async () => {
    await scenario.withThreeRecommendationsAndSetScores(-5, 0, 15);

    const total = 100;
    const uncertainty = 0.2; // 20%
    let scoreHigherThan10 = 0;
    for (let i = 0; i < total; i++) {
      const response = await supertest(app).get('/recommendations/random');
      expect(response.status).toBe(200);
      if (response.body.score > 10) scoreHigherThan10++;
    }

    expect(scoreHigherThan10 / total).toBeGreaterThanOrEqual(0.7 - uncertainty);
    expect(scoreHigherThan10 / total).toBeLessThanOrEqual(0.7 + uncertainty);
  });

  it('given no recommendation registered should return nothing, expect 404', async () => {
    const response = await supertest(app).get('/recommendations/random');
    expect(response.status).toBe(404);
    expect(Object.keys(response.body).length).toBe(0);
  });

  it('should return a music recommendation, expect 200', async () => {
    await scenario.withThreeRecommendationsAndSetScores(15, 200, 105);

    const response = await supertest(app).get('/recommendations/random');
    const { id, name, youtubeLink, score } = response.body;
    expect(response.status).toBe(200);

    expect(id).not.toBeUndefined();
    expect(name).not.toBeUndefined();
    expect(youtubeLink).not.toBeUndefined();
    expect(score).not.toBeUndefined();
  });

  it('should return a music recommendation, expect 200', async () => {
    await scenario.withThreeRecommendationsAndSetScores(-5, 0, 5);

    const response = await supertest(app).get('/recommendations/random');
    const { id, name, youtubeLink, score } = response.body;
    expect(response.status).toBe(200);
    expect(id).not.toBeUndefined();
    expect(name).not.toBeUndefined();
    expect(youtubeLink).not.toBeUndefined();
    expect(score).not.toBeUndefined();
  });
});

describe('get top upvoted recommendations tests', () => {
  it('should return the recommendations list within the amount informed ordened by score, expect 200', async () => {
    const amount = getRandomNumber(2, 10);
    await recommendationFactory.createManyRecommendations(amount + 1);

    const response = await supertest(app).get(`/recommendations/top/${amount}`);
    const recommendationsReturned = response.body;
    console.log(
      '🚀 ~ file: recommendations.get.test.ts ~ line 114 ~ it ~ recommendationsReturned',
      recommendationsReturned
    );

    expect(response.status).toBe(200);
    expect(recommendationsReturned.length).toBe(amount);
    expect(isRecommendationsSortedByOrder(recommendationsReturned)).toBe(true);
  });

  it('given a value greater than the amount of recommendations stored should return all, expect 200', async () => {
    const amount = 999;
    await recommendationFactory.createManyRecommendations(10);

    const response = await supertest(app).get(`/recommendations/top/${amount}`);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(10);
  });
});

afterAll(async () => {
  await scenario.clearRecommendations();
});

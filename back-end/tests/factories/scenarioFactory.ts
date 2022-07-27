import { prisma } from '../../src/database.js';
import recommendationFactory from './recommendationFactory.js';

async function clearRecommendations() {
  await prisma.recommendation.deleteMany();
}

async function withRecommendationsCreated(quantity = 11) {
  const promises = [];
  for (let i = 0; i < quantity; i++)
    promises.push(recommendationFactory.createRecommendation(String(i)));
  await Promise.all(promises);
}

const scenario = {
  clearRecommendations,
  withRecommendationsCreated,
};

export default scenario;

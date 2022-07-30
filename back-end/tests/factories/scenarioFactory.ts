import { prisma } from '../../src/database.js';
import recommendationFactory from './recommendationFactory.js';

async function clearRecommendations() {
  await prisma.recommendation.deleteMany();
}

async function withThreeRecommendationsAndSetScores(
  score1: number,
  score2: number,
  score3: number
) {
  const recommendations = [
    recommendationFactory.createRecommendation('one', null, score1),
    recommendationFactory.createRecommendation('two', null, score2),
    recommendationFactory.createRecommendation('three', null, score3),
  ];

  await Promise.all(recommendations);
}

async function withTenRecommendationsAndRandomScores() {
  await recommendationFactory.createManyRecommendations(10);
}

const scenario = {
  clearRecommendations,
  withThreeRecommendationsAndSetScores,
  withTenRecommendationsAndRandomScores,
};

export default scenario;

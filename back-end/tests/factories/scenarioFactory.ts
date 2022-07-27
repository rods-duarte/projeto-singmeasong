import { prisma } from '../../src/database.js';

async function clearRecommendations() {
  await prisma.recommendation.deleteMany();
}

const scenario = {
  clearRecommendations,
};

export default scenario;

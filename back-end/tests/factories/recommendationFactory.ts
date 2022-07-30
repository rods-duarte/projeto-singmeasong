import { faker } from '@faker-js/faker';
import { CreateRecommendationData } from '../../src/services/recommendationsService.js';
import { prisma } from '../../src/database.js';
import { getRandomNumber } from '../testUtils.js';

function createRecommendationData(
  name: string = faker.music.songName(),
  youtubeLink: string = `https://www.youtube.com/${faker.random.alpha()}`
): CreateRecommendationData {
  return {
    name,
    youtubeLink,
  };
}

async function createRecommendation(
  name = null,
  youtubeLink = null,
  score = null
) {
  const recommendation = await prisma.recommendation.create({
    data: {
      name: name || faker.music.songName(),
      youtubeLink:
        youtubeLink || `https://www.youtube.com/${faker.random.alpha()}`,
      score: score || getRandomNumber(-4, 10),
    },
  });
  return recommendation;
}

async function createManyRecommendations(quantity = 11) {
  const recommendationsPromises = [];
  for (let i = 0; i < quantity; i++) {
    recommendationsPromises.push(createRecommendation(String(i)));
  }
  await Promise.all(recommendationsPromises);
}

async function updateScore(newScore: number, id: number) {
  await prisma.recommendation.update({
    where: { id },
    data: { score: newScore },
  });
}

const recommendationFactory = {
  createRecommendationData,
  createRecommendation,
  createManyRecommendations,
  updateScore,
};

export default recommendationFactory;

import { faker } from '@faker-js/faker';
import { CreateRecommendationData } from '../../src/services/recommendationsService.js';
import { prisma } from '../../src/database.js';

export function createRecommendationData(
  name: string = faker.music.songName(),
  youtubeLink: string = `https://www.youtube.com/${faker.random.alpha()}`
): CreateRecommendationData {
  return {
    name,
    youtubeLink,
  };
}

export async function createRecommendation(
  { name, youtubeLink }: CreateRecommendationData = {
    name: faker.music.songName(),
    youtubeLink: `https://www.youtube.com/${faker.random.alpha()}`,
  }
) {
  const recommendation = await prisma.recommendation.create({
    data: {
      name,
      youtubeLink,
    },
  });
  return recommendation;
}

const recommendationFactory = {
  createRecommendationData,
  createRecommendation,
};

export default recommendationFactory;

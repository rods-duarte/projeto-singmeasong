import { Recommendation } from '@prisma/client';

export function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

export function isRecommendationsSortedByOrder(arr: Recommendation[]) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i].score > arr[i - 1].score) {
      return false;
    }
  }
  return true;
}

import { faker } from "@faker-js/faker";

const API_URL = "http://localhost:5000";

Cypress.Commands.add(
  "createRecommendation",
  (
    name = faker.music.songName(),
    youtubeLink = `https://www.youtube.com/${faker.random.alpha()}`
  ) => {
    cy.intercept("POST", "/recommendations").as("postRecommendation");
    cy.request("POST", `${API_URL}/recommendations`, {
      name,
      youtubeLink,
    });
  }
);

Cypress.Commands.add("clearDatabase", () => {
  cy.request("POST", `http://localhost:5000/recommendations/clear`);
});

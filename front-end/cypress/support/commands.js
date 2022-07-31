import { faker } from "@faker-js/faker";

const URL = "http://localhost:3000/";
const API_URL = "http://localhost:5000/";

Cypress.Commands.add(
  "createRecommendation",
  (
    name = faker.music.songName(),
    link = `https://www.youtube.com/${faker.random.alpha()}`
  ) => {
    cy.visit(URL);
    if (name) cy.get("#name").type(name);
    if (link) cy.get("#link").type(link);

    cy.intercept("POST", "/recommendations").as("postRecommendation");
    cy.get("#submit").click();
    cy.wait("@postRecommendation");
  }
);

Cypress.Commands.add("clearDatabase", () => {
  cy.request("post", `http://localhost:5000/recommendations/clear`);
});

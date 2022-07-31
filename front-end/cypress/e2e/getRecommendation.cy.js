import { faker } from "@faker-js/faker";

const URL = "http://localhost:3000";

beforeEach(() => {
  cy.clearDatabase();
});

describe("get recommendation tests", () => {
  describe("random page tests", () => {
    it("should display recommendation", () => {
      const name = faker.hacker.adjective();
      cy.createRecommendation(name);

      cy.intercept("GET", "/recommendations/random").as(
        "getRandomRecommendation"
      );
      cy.visit(`${URL}/random`);
      cy.wait("@getRandomRecommendation");

      cy.contains(name).should("be.visible");
    });
  });

  describe("top page tests", () => {
    it("should display recommendation", () => {
      const name = faker.hacker.adjective();
      cy.createRecommendation(name);

      cy.intercept("GET", "/recommendations/top/10").as("getTopRecommendation");
      cy.visit(`${URL}/top`);
      cy.wait("@getTopRecommendation");

      cy.contains(name).should("be.visible");
    });

    it("should not display any recommendation", () => {
      cy.intercept("GET", "/recommendations/top/10").as("getTopRecommendation");
      cy.visit(`${URL}/top`);
      cy.wait("@getTopRecommendation");

      cy.contains("No recommendations yet! Create your own :)").should(
        "be.visible"
      );
    });
  });
});

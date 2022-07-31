import { faker } from "@faker-js/faker";

beforeEach(() => {
  cy.clearDatabase();
});

describe("get recommendation tests", () => {
  describe("random page tests", () => {
    it("should display recommendation", () => {
      const name = faker.hacker.adjective();
      cy.createRecommendation(name);

      cy.contains("Random").click();

      cy.contains(name).should("be.visible");
    });

    it("should not display any recommendation", () => {
      cy.contains("Random").click();
      cy.contains("No recommendations yet! Create your own :)").should(
        "be.visible"
      );
    });
  });

  describe("top page tests", () => {
    it("should display recommendations", () => {
      const name = faker.hacker.adjective();
      cy.createRecommendation(name);

      cy.contains("Top").click();

      cy.contains(name).should("be.visible");
    });

    it("should not display any recommendation", () => {
      cy.contains("Top").click();
      cy.contains("No recommendations yet! Create your own :)").should(
        "be.visible"
      );
    });
  });
});

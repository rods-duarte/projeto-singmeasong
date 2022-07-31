const URL = "http://localhost:3000";

beforeEach(() => {
  cy.clearDatabase();
});

describe("voting recommendation tests", () => {
  describe("upvoting tests", () => {
    it("should upvote", () => {
      cy.createRecommendation();

      cy.visit(URL);
      cy.get("#upvote").click();
      cy.get("#score").should("contain.text", "1");
    });
  });

  describe("downvoting tets", () => {
    it("should downvote", () => {
      cy.createRecommendation();

      cy.visit(URL);
      cy.get("#downvote").click();
      cy.get("#score").should("contain.text", "-1");
    });

    it("if score is less than -5 should delete", () => {
      cy.createRecommendation();

      cy.visit(URL);
      cy.get("#downvote").click().click().click().click().click().click(); // 6 clicks

      cy.contains("No recommendations yet! Create your own :)").should(
        "be.visible"
      );
    });
  });
});

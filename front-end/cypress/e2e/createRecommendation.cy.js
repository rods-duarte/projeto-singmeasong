/// <reference types="cypress" />

import { faker } from "@faker-js/faker";

beforeEach(() => {
  cy.clearDatabase();
});

describe("create recommendation test", () => {
  it("given valid input should create", () => {
    const name = faker.music.songName();

    cy.createRecommendation(name);
    cy.contains(name).should("be.visible");
  });

  it("given invalid link should fail", () => {
    cy.createRecommendation(undefined, "https://link.com");
    cy.on("window:alert", (message) => {
      expect(message).contains("Error creating recommendation!");
    });
  });

  it("given invalid name should fail", () => {
    cy.createRecommendation(null);

    cy.on("window:alert", (message) => {
      expect(message).contains("Error creating recommendation!");
    });
  });
});

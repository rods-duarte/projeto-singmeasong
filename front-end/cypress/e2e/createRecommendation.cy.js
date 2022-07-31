/// <reference types="cypress" />

import { faker } from "@faker-js/faker";

const URL = "http://localhost:3000/";

beforeEach(() => {
  cy.clearDatabase();
});

describe("create recommendation test", () => {
  it("given valid input should create", () => {
    const name = faker.music.songName();
    const link = `https://www.youtube.com/${faker.random.alpha(5)}`;

    cy.visit(URL);
    cy.get("#name").type(name);
    cy.get("#link").type(link);

    cy.intercept("POST", "/recommendations").as("postRecommendation");
    cy.get("#submit").click();
    cy.wait("@postRecommendation");

    cy.contains(name).should("be.visible");
  });

  it("given invalid link should fail", () => {
    const name = faker.music.songName();
    const link = `https://www.link.com`;

    cy.visit(URL);
    cy.get("#name").type(name);
    cy.get("#link").type(link);

    cy.intercept("POST", "/recommendations").as("postRecommendation");
    cy.get("#submit").click();
    cy.wait("@postRecommendation");

    cy.on("window:alert", (message) => {
      expect(message).contains("Error creating recommendation!");
    });
  });

  it("given invalid name should fail", () => {
    const link = `https://www.youtube.com/${faker.random.alpha(5)}`;

    cy.visit(URL);
    cy.get("#link").type(link);

    cy.intercept("POST", "/recommendations").as("postRecommendation");
    cy.get("#submit").click();
    cy.wait("@postRecommendation");

    cy.on("window:alert", (message) => {
      expect(message).contains("Error creating recommendation!");
    });
  });
});

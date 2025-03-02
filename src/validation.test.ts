import exp from "constants";
import {
  slugValidator,
  createCategoryValidator,
  createQuestionValidator,
} from "./validation.js";
import { unknown } from "zod";

describe("validation", () => {
  describe("slugValidator", () => {
    it("should return true for valid slugs", () => {
      expect(slugValidator("valid-slug").success).toBe(true);
      expect(slugValidator("another123").success).toBe(true);
      expect(slugValidator("test-slug-456").success).toBe(true);
    });

    it("should return false for invalid slugs", () => {
      expect(slugValidator("InvalidSlug").success).toBe(false);
      expect(slugValidator("slug@wrong").success).toBe(false);
      expect(slugValidator("ab").success).toBe(false);
      expect(slugValidator("a".repeat(1025)).success).toBe(false);
    });

    it("should return false for all non-string inputs", () => {
      expect(slugValidator(123).success).toBe(false);
      expect(slugValidator(null).success).toBe(false);
      expect(slugValidator(undefined).success).toBe(false);
      expect(slugValidator([]).success).toBe(false);
      expect(slugValidator({}).success).toBe(false);
    });
  });

  describe("createCategoryValidator", () => {
    it("should return true for valid inputs", () => {
      expect(createCategoryValidator({ title: "testing" }).success).toBe(true);
      expect(
        createCategoryValidator({ title: "~~~weird-STRING920ööö" }).success
      ).toBe(true);
    });

    it("should return false for invalid inputs", () => {
      expect(createCategoryValidator({}).success).toBe(false);
      expect(createCategoryValidator("test").success).toBe(false);
      expect(createCategoryValidator([]).success).toBe(false);
      expect(createCategoryValidator(null).success).toBe(false);
      expect(createCategoryValidator(987).success).toBe(false);
    });

    it("should return false for inputs that break the schemas rules", () => {
      expect(createCategoryValidator({ title: 9 }).success).toBe(false);
      expect(createCategoryValidator({ title: "aa" }).success).toBe(false);
      expect(
        createCategoryValidator({
          title:
            " AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        }).success
      ).toBe(false);
    });
  });

  describe("createQuestionValidator", () => {
    it("should return true for valid inputs", () => {
      expect(
        createQuestionValidator({
          text: "testQuestion1?",
          cat_id: 9,
          answers: [
            { text: "answer1", correct: true },
            { text: "answer2", correct: false },
          ],
        }).success
      ).toBe(true);
      expect(
        createQuestionValidator({
          text: "-==23{{]?ððð´ööö?",
          cat_id: 10000,
          answers: [
            { text: "öööö", correct: true },
            { text: "-------", correct: false },
            {
              text: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
              correct: false,
            },
            { text: "aaa", correct: false },
          ],
        }).success
      ).toBe(true);
    });
    it("should return false for invalid inputs", () => {
      expect(createQuestionValidator("aaa"));
      expect(createQuestionValidator(987));
      expect(createQuestionValidator(true));
      expect(createQuestionValidator({}));
      expect(createQuestionValidator(unknown));
    });
    it("should return false for inputs that break the schemas rules", () => {
      expect(
        createQuestionValidator({
          text: "aa",
          cat_id: 9,
          answers: [
            { text: "answer1", correct: true },
            { text: "answer2", correct: false },
          ],
        }).success
      ).toBe(false);
      expect(
        createQuestionValidator({
          text: "test?",
          cat_id: "9",
          answers: [
            { text: "answer1", correct: true },
            { text: "answer2", correct: false },
          ],
        }).success
      ).toBe(false);
      expect(
        createQuestionValidator({
          text: "test?",
          cat_id: 9,
          answers: [
            { text: 1, correct: true },
            { text: "answer2", correct: false },
          ],
        }).success
      ).toBe(false);
      expect(
        createQuestionValidator({
          text: "test?",
          cat_id: 9,
          answers: [
            { text: "answer1", correct: "true" },
            { text: "answer2", correct: "false" },
          ],
        }).success
      ).toBe(false);
      expect(
        createQuestionValidator({
          text: "aa",
          cat_id: 9,
          answers: [{ text: "answer1", correct: true }],
        }).success
      ).toBe(false);
      expect(
        createQuestionValidator({
          text: "aa",
          cat_id: 9,
          answers: [
            { text: "answer1", correct: true },
            { text: "answer2", correct: false },
            { text: "answer3", correct: false },
            { text: "answer4", correct: false },
            { text: "answer5", correct: false },
            { text: "answer6", correct: false },
            { text: "answer7", correct: false },
            { text: "answer8", correct: false },
            { text: "answer9", correct: false },
          ],
        }).success
      ).toBe(false);
    });
  });
});

import { PrismaClient } from "@prisma/client";
import {
  getQuestions,
  getQuestionsCat,
  createQuestion,
  getQuestion,
  patchQuestion,
  deleteQuestion,
  getAnswers,
} from "./questions.db.js";

vi.mock("@prisma/client", () => {
  const prismaMock = {
    questions: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    answers: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  };
  return {
    PrismaClient: vi.fn(() => prismaMock),
  };
});

describe("question.db", () => {
  let prisma: PrismaClient;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = new PrismaClient();
  });
  describe("getQuestions", () => {
    it("should return all questions with their answers", async () => {
      const mockQuestions = [{ id: 1, text: "testQuestion", cat_id: 2 }];
      (
        prisma.questions.findMany as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockQuestions);
      (
        prisma.answers.findMany as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue([
        { id: 1, text: "testAnswer", correct: true, q_id: 1 },
      ]);

      const result = await getQuestions();

      expect(prisma.questions.findMany).toHaveBeenCalledOnce();
      expect(prisma.answers.findMany).toHaveBeenCalledOnce();
      expect(result).toEqual([
        {
          id: 1,
          text: "testQuestion",
          cat_id: 2,
          answers: [{ id: 1, text: "testAnswer", correct: true, q_id: 1 }],
        },
      ]);
    });
  });

  describe("getQuestionsCat", () => {
    it("should only return questions that have the cat_id", async () => {
      const mockQuestions = [{ id: 1, text: "testQuestion", cat_id: 2 }];
      (
        prisma.questions.findMany as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockQuestions);
      (
        prisma.answers.findMany as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue([
        { id: 1, text: "testAnswer", correct: true, q_id: 1 },
      ]);

      const result = await getQuestionsCat(2);

      expect(prisma.questions.findMany).toHaveBeenCalledOnce();
      expect(prisma.answers.findMany).toHaveBeenCalledOnce();
      expect(result).toEqual([
        {
          id: 1,
          text: "testQuestion",
          cat_id: 2,
          answers: [{ id: 1, text: "testAnswer", correct: true, q_id: 1 }],
        },
      ]);
    });
  });

  describe("getAnswers", () => {
    it("should return all answers that have the q_id", async () => {
      const mockAnswers = [
        { id: 1, text: "testAnswer", correct: true, q_id: 1 },
      ];
      (
        prisma.answers.findMany as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAnswers);

      const result = await getAnswers(1);

      expect(prisma.answers.findMany).toHaveBeenCalledOnce();
      expect(result).toEqual(mockAnswers);
    });
  });

  describe("createQuestion", () => {
    it("should create a question with answers", async () => {
      const mockQuestion = { id: 1, text: "testQuestion", cat_id: 2 };
      const mockAnswers = [
        { id: 1, text: "testAnswer", correct: true, q_id: 1 },
      ];
      (
        prisma.questions.create as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockQuestion);
      (
        prisma.answers.create as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAnswers[0]);

      const result = await createQuestion({
        text: "testQuestion",
        cat_id: 2,
        answers: [{ text: "testAnswer", correct: true }],
      });

      expect(prisma.questions.create).toHaveBeenCalledOnce();
      expect(prisma.answers.create).toHaveBeenCalledOnce();
      expect(result).toEqual({
        id: 1,
        text: "testQuestion",
        cat_id: 2,
        answers: mockAnswers,
      });
    });
  });

  describe("getQuestion", () => {
    it("should return a question with answers based on ID", async () => {
      const mockQuestion = { id: 1, text: "testQuestion", cat_id: 2 };
      const mockAnswers = [
        { id: 1, text: "testAnswer", correct: true, q_id: 1 },
      ];
      (
        prisma.questions.findUnique as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockQuestion);
      (
        prisma.answers.findMany as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAnswers);

      const result = await getQuestion(1);

      expect(prisma.questions.findUnique).toHaveBeenCalledOnce();
      expect(prisma.answers.findMany).toHaveBeenCalledOnce();
      expect(result).toEqual({
        id: 1,
        text: "testQuestion",
        cat_id: 2,
        answers: mockAnswers,
      });
    });
  });
  describe("patchQuestion", () => {
    it("should update a question and replace answers", async () => {
      const mockUpdatedQuestion = {
        id: 1,
        text: "Updated question",
        cat_id: 2,
      };
      const mockUpdatedAnswers = [
        { id: 2, text: "Updated answer", correct: false, q_id: 1 },
      ];
      (
        prisma.questions.update as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockUpdatedQuestion);
      (
        prisma.answers.deleteMany as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(undefined);
      (
        prisma.answers.create as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockUpdatedAnswers[0]);

      const result = await patchQuestion(
        {
          text: "Updated question",
          cat_id: 2,
          answers: [{ text: "Updated answer", correct: false }],
        },
        1
      );

      expect(prisma.questions.update).toHaveBeenCalledOnce();
      expect(prisma.answers.deleteMany).toHaveBeenCalledOnce();
      expect(prisma.answers.create).toHaveBeenCalledOnce();
      expect(result).toEqual({
        id: 1,
        text: "Updated question",
        cat_id: 2,
        answers: mockUpdatedAnswers,
      });
    });
  });

  describe("deleteQuestion", () => {
    it("should delete a question and return its details", async () => {
      const mockDeletedQuestion = { id: 1, text: "testQuestion", cat_id: 2 };
      const mockAnswers = [
        { id: 1, text: "testAnswer", correct: true, q_id: 1 },
      ];
      (
        prisma.answers.findMany as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAnswers);
      (
        prisma.questions.delete as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockDeletedQuestion);

      const result = await deleteQuestion(1);

      expect(prisma.answers.findMany).toHaveBeenCalledOnce();
      expect(prisma.questions.delete).toHaveBeenCalledOnce();
      expect(result).toEqual({
        id: 1,
        text: "testQuestion",
        cat_id: 2,
        answers: mockAnswers,
      });
    });
  });
});

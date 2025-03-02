import { PrismaClient } from "@prisma/client";
import {
  getCategories,
  getCategory,
  getCategoryByID,
  createCategory,
  patchCategory,
  deleteCategory,
} from "./categories.db.js";

vi.mock("@prisma/client", () => {
  const prismaMock = {
    categories: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
  return {
    PrismaClient: vi.fn(() => prismaMock),
  };
});

describe("categories.db", () => {
  let prisma: PrismaClient;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = new PrismaClient();
  });

  describe("getCategories", () => {
    it("should return all categories in the db table", async () => {
      const mockCategories = [
        { id: 1, title: "html", slug: "html" },
        { id: 2, title: "css", slug: "css" },
        { id: 3, title: "js", slug: "js" },
      ];
      (
        prisma.categories.findMany as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockCategories);

      const result = await getCategories();

      expect(prisma.categories.findMany).toHaveBeenCalledOnce();
      expect(result).toEqual(mockCategories);
    });
  });

  describe("getCategory", () => {
    it("should return a category based on slug input", async () => {
      const mockCategory = { id: 3, title: "js", slug: "js" };
      (
        prisma.categories.findUnique as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockCategory);

      const result = await getCategory("js");

      expect(prisma.categories.findUnique).toHaveBeenCalledWith({
        where: { slug: "js" },
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe("getCategoryByID", () => {
    it("should get a category by ID", async () => {
      const mockCategory = { id: 2, title: "css", slug: "css" };
      (
        prisma.categories.findUnique as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockCategory);

      const result = await getCategoryByID(2);

      expect(prisma.categories.findUnique).toHaveBeenCalledWith({
        where: { id: 2 },
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe("createCategory", () => {
    it("should create a category", async () => {
      const mockCategory = { id: 1, title: "html", slug: "html" };
      (
        prisma.categories.create as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockCategory);

      const result = await createCategory({ title: "html" });

      expect(prisma.categories.create).toHaveBeenCalledWith({
        data: { title: "html", slug: "html" },
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe("patchCategory", () => {
    it("should change a category", async () => {
      const mockPatchedCategory = {
        id: 1,
        title: "not html",
        slug: "not-html",
      };
      (
        prisma.categories.update as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockPatchedCategory);

      const result = await patchCategory({ title: "not html" }, "html");

      expect(prisma.categories.update).toHaveBeenCalledWith({
        where: { slug: "html" },
        data: { title: "not html", slug: "not-html" },
      });
      expect(result).toEqual(mockPatchedCategory);
    });

    it("should delete a category", async () => {
      const mockDeletedCategory = { id: 1, title: "html", slug: "html" };
      (
        prisma.categories.delete as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockDeletedCategory);

      const result = await deleteCategory("html");

      expect(prisma.categories.delete).toHaveBeenCalledWith({
        where: { slug: "html" },
      });
      expect(result).toEqual(mockDeletedCategory);
    });
  });
});

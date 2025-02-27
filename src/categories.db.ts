import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const CategorySchema = z.object({
  id: z.number(),
  title: z
    .string()
    .min(3, "title must be at least three letters")
    .max(1024, "title must be at most 1024 letters"),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "invalid slug format")
    .min(3, "slug must be at least three letters")
    .max(1024, "slug must be at most 1024 letters"),
});

const CategoryToCreateSchema = z.object({
  title: z
    .string()
    .min(3, "title must be at least three letters")
    .max(1024, "title must be at most 1024 letters"),
});

const CategoryToPatchSchema = z.object({
  title: z
    .string()
    .min(3, "title must be at least three letters")
    .max(1024, "title must be at most 1024 letters"),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "invalid slug format")
    .min(3, "slug must be at least three letters")
    .max(1024, "slug must be at most 1024 letters"),
});

type Category = z.infer<typeof CategorySchema>;
type CategoryToCreate = z.infer<typeof CategoryToCreateSchema>;
type CategoryToPatch = z.infer<typeof CategoryToPatchSchema>;

const prisma = new PrismaClient();

export async function getCategories(
  limit: number = 10,
  offset: number = 0
): Promise<Array<Category>> {
  const categories = await prisma.categories.findMany();
  console.log("categories :>> ", categories);
  return categories;
}

export async function getCategory(slug: string): Promise<Category | null> {
  const category = await prisma.categories.findUnique({
    where: {
      slug: slug,
    },
  });

  return category ?? null;
}

export async function createCategory(
  categoryToCreate: CategoryToCreate
): Promise<Category> {
  const createdCategory = await prisma.categories.create({
    data: {
      title: categoryToCreate.title,
      slug: categoryToCreate.title.toLowerCase().replace(" ", "-"),
    },
  });

  return createdCategory;
}

export async function patchCategory(
  categoryToPatch: CategoryToPatch
): Promise<Category> {
  const patchedCategory = await prisma.categories.update({
    where: { slug: categoryToPatch.slug },
    data: {
      title: categoryToPatch.title,
    },
  });

  return patchedCategory;
}

export async function deleteCategory(slug: string): Promise<Category> {
  const deletedCategory = await prisma.categories.delete({
    where: {
      slug: slug,
    },
  });

  return deletedCategory;
}

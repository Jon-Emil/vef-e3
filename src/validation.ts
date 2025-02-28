import { z } from "zod";

export function slugValidator(slug: unknown) {
  const slugSchema = z
    .string()
    .regex(/^[a-z0-9-]+$/, "invalid slug format")
    .min(3, "slug must be at least three letters")
    .max(1024, "slug must be at most 1024 letters");

  const result = slugSchema.safeParse(slug);

  return result;
}

export function createCategoryValidator(category: unknown) {
  const categorySchema = z.object({
    title: z
      .string()
      .min(3, "title must be at least three letters")
      .max(1024, "title must be at most 1024 letters"),
  });

  const result = categorySchema.safeParse(category);

  return result;
}

export function patchCategoryValidator(category: unknown) {
  const categorySchema = z.object({
    title: z
      .string()
      .min(3, "title must be at least three letters")
      .max(1024, "title must be at most 1024 letters"),
    slug: z.string().default(""),
  });

  const result = categorySchema.safeParse(category);

  if (result.success) {
    result.data.slug = "";
  }

  return result;
}

export function createQuestionValidator(question: unknown) {
  const answerToCreateSchema = z.object({
    text: z
      .string()
      .min(1, "answer must be atleast 1 letters")
      .max(1024, "answer must be atmost 1024 letters"),
    correct: z.boolean(),
  });

  const questionToCreateSchema = z.object({
    text: z
      .string()
      .min(3, "question must be atleast 3 letters")
      .max(1024, "question must be atmost 1024 letters"),
    cat_id: z.number(),
    answers: z
      .array(answerToCreateSchema)
      .min(2, "a question must have atleast 2 questions")
      .max(8, "a question must have atmost 8 answers"),
  });

  const result = questionToCreateSchema.safeParse(question);

  return result;
}

import { z } from "zod";
import { PrismaClient } from "@prisma/client";

export const answerSchema = z.object({
  id: z.number(),
  text: z
    .string()
    .min(1, "answer must be atleast 1 letters")
    .max(1024, "answer must be atmost 1024 letters"),
  correct: z.boolean(),
  q_id: z.number(),
});

export const answerToCreateSchema = z.object({
  text: z
    .string()
    .min(1, "answer must be atleast 1 letters")
    .max(1024, "answer must be atmost 1024 letters"),
  correct: z.boolean(),
});

export const questionSchema = z.object({
  id: z.number(),
  text: z
    .string()
    .min(3, "question must be atleast 3 letters")
    .max(1024, "question must be atmost 1024 letters"),
  cat_id: z.number(),
  answers: z
    .array(answerSchema)
    .min(2, "a question must have atleast 2 questions")
    .max(8, "a question must have atmost 8 answers"),
});

export const questionToCreateSchema = z.object({
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

export type question = z.infer<typeof questionSchema>;
export type questionToCreate = z.infer<typeof questionToCreateSchema>;
export type answer = z.infer<typeof answerSchema>;

const prisma = new PrismaClient();

export async function getQuestions(): Promise<Array<question>> {
  const questions = await prisma.questions.findMany();
  const correctQuestions = await Promise.all(
    questions.map(async (question) => {
      const answers = await getAnswers(question.id);
      const questionWithAnswers: question = {
        id: question.id,
        text: question.text,
        cat_id: question.cat_id,
        answers: answers,
      };
      return questionWithAnswers;
    })
  );
  console.log("questions :>> ", correctQuestions);
  return correctQuestions;
}

export async function getQuestionsCat(c_id: number): Promise<Array<question>> {
  const questions = await prisma.questions.findMany({
    where: { cat_id: c_id },
  });
  const correctQuestions = await Promise.all(
    questions.map(async (question) => {
      const answers = await getAnswers(question.id);
      const questionWithAnswers: question = {
        id: question.id,
        text: question.text,
        cat_id: question.cat_id,
        answers: answers,
      };
      return questionWithAnswers;
    })
  );
  console.log("questions :>> ", correctQuestions);
  return correctQuestions;
}

export async function getAnswers(q_id: number): Promise<Array<answer>> {
  const answers = await prisma.answers.findMany({
    where: { q_id: q_id },
  });
  return answers;
}

export async function createQuestion(
  questionToCreate: questionToCreate
): Promise<question> {
  const createdQuestion = await prisma.questions.create({
    data: {
      text: questionToCreate.text,
      cat_id: questionToCreate.cat_id,
    },
  });

  const correctAnswers = await Promise.all(
    questionToCreate.answers.map(async (answer) => {
      const createdAnswer = await prisma.answers.create({
        data: {
          text: answer.text,
          correct: answer.correct,
          q_id: createdQuestion.id,
        },
      });
      return createdAnswer;
    })
  );

  const returnQuestion: question = {
    id: createdQuestion.id,
    text: createdQuestion.text,
    cat_id: createdQuestion.cat_id,
    answers: correctAnswers,
  };

  return returnQuestion;
}

export async function getQuestion(q_id: number): Promise<question | null> {
  const question = await prisma.questions.findUnique({
    where: { id: q_id },
  });

  if (!question) {
    return null;
  }

  const answers = await getAnswers(q_id);

  const returnQuestion: question = {
    id: question.id,
    text: question.text,
    cat_id: question.cat_id,
    answers: answers,
  };

  return returnQuestion;
}

export async function patchQuestion(
  questionToPatch: questionToCreate,
  old_id: number
): Promise<question> {
  const patchedQuestion = await prisma.questions.update({
    where: { id: old_id },
    data: {
      text: questionToPatch.text,
      cat_id: questionToPatch.cat_id,
    },
  });

  await prisma.answers.deleteMany({
    where: { q_id: old_id },
  });

  const patchedAnswers = await Promise.all(
    questionToPatch.answers.map(async (answer) => {
      const createdAnswer = await prisma.answers.create({
        data: {
          text: answer.text,
          correct: answer.correct,
          q_id: patchedQuestion.id,
        },
      });
      return createdAnswer;
    })
  );

  const returnQuestion: question = {
    id: patchedQuestion.id,
    text: patchedQuestion.text,
    cat_id: patchedQuestion.cat_id,
    answers: patchedAnswers,
  };

  return returnQuestion;
}

export async function deleteQuestion(question_id: number): Promise<question> {
  const oldAnswers = await prisma.answers.findMany({
    where: {
      q_id: question_id,
    },
  });

  const deletedQuestion = await prisma.questions.delete({
    where: {
      id: question_id,
    },
  });

  const returnQuestion: question = {
    id: deletedQuestion.id,
    text: deletedQuestion.text,
    cat_id: deletedQuestion.cat_id,
    answers: oldAnswers,
  };

  return returnQuestion;
}

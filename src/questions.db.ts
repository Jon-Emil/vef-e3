import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const answerSchema = z.object({
  id: z.number(),
  text: z
    .string()
    .min(1, "answer must be atleast 1 letters")
    .max(1024, "answer must be atmost 1024 letters"),
  correct: z.boolean(),
  q_id: z.number(),
});

const answerToCreateSchema = z.object({
  text: z
    .string()
    .min(1, "answer must be atleast 1 letters")
    .max(1024, "answer must be atmost 1024 letters"),
  correct: z.boolean(),
});

const questionSchema = z.object({
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

type question = z.infer<typeof questionSchema>;
type questionToCreate = z.infer<typeof questionToCreateSchema>;
type answer = z.infer<typeof answerSchema>;

const prisma = new PrismaClient();

export async function getQuestions(
  limit: number = 10,
  offset: number = 0
): Promise<Array<question>> {
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

export async function getQuestionsCat(
  c_id: number,
  limit: number = 10,
  offset: number = 0
): Promise<Array<question>> {
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

async function getAnswers(q_id: number): Promise<Array<answer>> {
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

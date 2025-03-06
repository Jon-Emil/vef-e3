import { serve } from "@hono/node-server";
import { Hono } from "hono";
import xss from "xss";
import {
  createCategory,
  patchCategory,
  getCategories,
  getCategory,
  getCategoryByID,
  deleteCategory,
} from "./categories.db.js";
import {
  slugValidator,
  createCategoryValidator,
  createQuestionValidator,
} from "./validation.js";
import {
  getQuestions,
  getQuestionsCat,
  createQuestion,
  getQuestion,
  patchQuestion,
  deleteQuestion,
} from "./questions.db.js";

const app = new Hono();

app.get("/", (c) => {
  return c.json([
    {
      href: "/categories",
      methods: ["GET", "POST"],
    },
    {
      href: "/categories/:slug",
      methods: ["GET", "PATCH", "DELETE"],
    },
    {
      href: "/questions",
      methods: ["GET", "POST"],
    },
    {
      href: "/questions/:cat_id",
      methods: ["GET"],
    },
    {
      href: "/questions/:question_id",
      methods: ["PATCH", "DELETE"],
    },
  ]);
});

app.get("/categories", async (c) => {
  try {
    const categories = await getCategories();
    return c.json(categories, 200);
  } catch (e) {
    console.error(e);
    return c.json({ message: "an error came up" }, 500);
  }
});

app.get("/categories/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");

    const validSlug = slugValidator(slug);

    if (!validSlug.success) {
      return c.json(
        { error: "invalid data", errors: validSlug.error.flatten() },
        400
      );
    }

    const category = await getCategory(slug);

    if (!category) {
      return c.json({ message: "not found" }, 404);
    }

    return c.json(category);
  } catch (e) {
    console.error(e);
    return c.json({ message: "an error came up" }, 500);
  }
});

app.post("/categories", async (c) => {
  try {
    let categoryToCreate: unknown;

    try {
      categoryToCreate = await c.req.json();
      console.log(categoryToCreate);
    } catch (e) {
      console.error(e);
      return c.json({ error: "invalid json" }, 400);
    }

    const validCategory = createCategoryValidator(categoryToCreate);

    if (!validCategory.success) {
      return c.json(
        { error: "invalid data", errors: validCategory.error.flatten() },
        400
      );
    }

    validCategory.data.title = xss(validCategory.data.title);

    const createdCategory = await createCategory(validCategory.data);

    return c.json(createdCategory, 201);
  } catch (e) {
    console.error(e);
    return c.json({ error: "an error came up" }, 500);
  }
});

app.patch("/categories/:slug", async (c) => {
  try {
    let categoryToPatch: unknown;

    try {
      categoryToPatch = await c.req.json();
      console.log(categoryToPatch);
    } catch (e) {
      console.error(e);
      return c.json({ error: "invalid json" }, 400);
    }

    const validCategory = createCategoryValidator(categoryToPatch);

    if (!validCategory.success) {
      return c.json(
        { error: "invalid data", errors: validCategory.error.flatten() },
        400
      );
    }

    let slug = c.req.param("slug");
    const validSlug = slugValidator(slug);

    if (!validSlug.success) {
      return c.json(
        { error: "invalid data", errors: validSlug.error.flatten() },
        400
      );
    }

    slug = xss(slug);
    const category = await getCategory(slug);

    if (!category) {
      return c.json({ message: "not found" }, 404);
    }

    validCategory.data.title = xss(validCategory.data.title);
    validSlug.data = xss(validSlug.data);

    const patchedCategory = await patchCategory(
      validCategory.data,
      validSlug.data
    );

    return c.json(patchedCategory, 201);
  } catch (e) {
    console.error(e);
    return c.json({ error: "an error came up" }, 500);
  }
});

app.delete("/categories/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    const validSlug = slugValidator(slug);

    if (!validSlug.success) {
      return c.json(
        { error: "invalid data", errors: validSlug.error.flatten() },
        400
      );
    }

    const category = await getCategory(validSlug.data);

    if (!category) {
      return c.json({ message: "not found" }, 404);
    }

    const deletedCategory = await deleteCategory(slug);

    console.log("deleted this category: ", deletedCategory);

    return c.body(null, 204);
  } catch (e) {
    console.error(e);
    return c.json({ error: "an error came up" }, 500);
  }
});

app.get("/questions", async (c) => {
  try {
    const questions = await getQuestions();
    return c.json(questions);
  } catch (e) {
    console.error(e);
    return c.json({ message: "an error came up" }, 500);
  }
});

app.get("/questions/:cat_id", async (c) => {
  try {
    const cat_id = Number(c.req.param("cat_id"));
    if (isNaN(cat_id)) {
      return c.json({ message: "category id must be a number" }, 400);
    }

    if (!(await getCategoryByID(cat_id))) {
      return c.json({ message: "category not found" }, 404);
    }

    const questions = await getQuestionsCat(cat_id);
    return c.json(questions);
  } catch (e) {
    console.error(e);
    return c.json({ message: "an error came up" }, 500);
  }
});

app.post("/questions", async (c) => {
  try {
    let questionToCreate: unknown;

    try {
      questionToCreate = await c.req.json();
      console.log(questionToCreate);
    } catch (e) {
      console.error(e);
      return c.json({ error: "invalid json" }, 400);
    }

    const validQuestion = createQuestionValidator(questionToCreate);

    if (!validQuestion.success) {
      return c.json(
        { error: "invalid data", errors: validQuestion.error.flatten() },
        400
      );
    }

    if (!(await getCategoryByID(validQuestion.data.cat_id))) {
      return c.json({ message: "invalid category" }, 400);
    }

    validQuestion.data.text = xss(validQuestion.data.text);
    validQuestion.data.answers = validQuestion.data.answers.map((ans) => ({
      text: xss(ans.text),
      correct: ans.correct,
    }));

    const createdQuestion = await createQuestion(validQuestion.data);

    return c.json(createdQuestion, 201);
  } catch (e) {
    console.error(e);
    return c.json({ error: "an error came up" }, 500);
  }
});

app.patch("/questions/:question_id", async (c) => {
  let questionToPatch: unknown;

  try {
    questionToPatch = await c.req.json();
    console.log(questionToPatch);
  } catch (e) {
    console.error(e);
    return c.json({ error: "invalid json" }, 400);
  }

  const validQuestion = createQuestionValidator(questionToPatch);

  if (!validQuestion.success) {
    return c.json(
      { error: "invalid data", errors: validQuestion.error.flatten() },
      400
    );
  }

  const q_id = Number(c.req.param("question_id"));

  if (isNaN(q_id)) {
    return c.json({ message: "category id must be a number" }, 400);
  }

  const question = await getQuestion(q_id);

  if (!question) {
    return c.json({ message: "question does not exist" }, 404);
  }

  validQuestion.data.text = xss(validQuestion.data.text);
  validQuestion.data.answers = validQuestion.data.answers.map((ans) => ({
    text: xss(ans.text),
    correct: ans.correct,
  }));

  const patchedQuestion = await patchQuestion(validQuestion.data, q_id);
  return c.json(patchedQuestion, 201);
});

app.delete("/questions/:question_id", async (c) => {
  const q_id = Number(c.req.param("question_id"));

  if (isNaN(q_id)) {
    return c.json({ message: "category id must be a number" }, 400);
  }

  const question = await getQuestion(q_id);

  if (!question) {
    return c.json({ message: "question does not exist" }, 404);
  }

  const deletedQuestion = deleteQuestion(q_id);

  console.log("deleted this question: ", deletedQuestion);

  return c.body(null, 204);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

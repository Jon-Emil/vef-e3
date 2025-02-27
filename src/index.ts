import { serve } from "@hono/node-server";
import { Hono } from "hono";
import {
  createCategory,
  patchCategory,
  getCategories,
  getCategory,
  deleteCategory,
} from "./categories.db.js";
import {
  slugValidator,
  createCategoryValidator,
  patchCategoryValidator,
} from "./validation.js";

const app = new Hono();

app.get("/", (c) => {
  const data = {
    hello: "hono",
  };

  return c.json(data);
});

app.get("/categories", async (c) => {
  try {
    const categories = await getCategories();
    return c.json(categories);
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
      return c.json({ error: "invalid json" }, 400);
    }

    const validCategory = createCategoryValidator(categoryToCreate);

    if (!validCategory.success) {
      return c.json(
        { error: "invalid data", errors: validCategory.error.flatten() },
        400
      );
    }

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
      return c.json({ error: "invalid json" }, 400);
    }

    const validCategory = patchCategoryValidator(categoryToPatch);

    if (!validCategory.success) {
      return c.json(
        { error: "invalid data", errors: validCategory.error.flatten() },
        400
      );
    }

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

    validCategory.data.slug = validSlug.data;
    const patchedCategory = await patchCategory(validCategory.data);

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

    return c.json(deletedCategory, 200);
  } catch (e) {
    console.error(e);
    return c.json({ error: "an error came up" }, 500);
  }
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

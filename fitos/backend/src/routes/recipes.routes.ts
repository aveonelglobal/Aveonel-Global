import { Router } from "express";
import { listAllRecipes, queryRecipes } from "../modules/recipes/recipes.service";
import { RecipeCategory } from "../types";

export const recipesRouter = Router();

const VALID_CATEGORIES: RecipeCategory[] = ["breakfast", "lunch", "dinner", "snack", "beverage"];

/** GET /recipes?category=breakfast - browse the recipe library (frontend/browse UI). */
recipesRouter.get("/recipes", async (req, res, next) => {
  try {
    const category = req.query.category as string | undefined;
    if (category && !VALID_CATEGORIES.includes(category as RecipeCategory)) {
      res.status(400).json({ error: `category must be one of ${VALID_CATEGORIES.join(", ")}` });
      return;
    }
    const recipes = category
      ? await queryRecipes({ category: category as RecipeCategory })
      : await listAllRecipes();
    res.json(recipes);
  } catch (err) {
    next(err);
  }
});

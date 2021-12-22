const router = require("express").Router();
const controller = require("./categories.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router
  .route("/:categoryId/items")
  .get(controller.listCategoryItems)
  .all(methodNotAllowed);
router.route("/:categoryId").get(controller.read).all(methodNotAllowed);
router.route("/").get(controller.list).all(methodNotAllowed);

module.exports = router;

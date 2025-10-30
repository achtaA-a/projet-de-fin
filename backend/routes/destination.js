const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const destinationController = require("../controllers/destination");

router.post("/", upload.single("image"), destinationController.creerDestination);
router.get("/", destinationController.obtenirToutesDestinations);
router.get("/:id", destinationController.obtenirDestination);

module.exports = router;

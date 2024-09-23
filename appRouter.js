const express = require("express");

const appRouter = express.Router();
appRouter.use(express.json());

/**
 * Get all displayItems.
 */
appRouter.get("/getDisplayItems", async (_req, res) => {
    try {

    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * Delete a project.
 */
appRouter.delete("/displayItems", async (_req, res) => {

});

/**
 * Create a project.
 */
appRouter.post("/displayItems", async (_req, res) => {
    try {

    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * Update a project.
 */
appRouter.put("/displayItems", async (_req, res) => {

});

module.exports = {
    appRouter: appRouter
}
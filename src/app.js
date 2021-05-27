const express = require("express");
const cors = require("cors");
const { v4: uuidv4, validate: uuidValidate } = require("uuid");

// const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

function validateUUID(request, response, next) {  
  const { id } = request.params;

  if(!uuidValidate(id)) return response.status(400).json({error: "Invalid repository id"});

  return next();
}

app.use('/repositories/:id', validateUUID);

const repositories = [];

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repo = {id: uuidv4(), title, url, techs, likes: 0};

  repositories.push(repo);

  return response.json(repo);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repoIndex = repoIndexById(id);

  if(repoIndex < 0) return response.status(400).json({error: "Repository not found"});

  const repo = {
    ...repositories[repoIndex], title, url, techs
  }

  repositories[repoIndex] = repo;

  return response.json(repo);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repoIndex = repoIndexById(id);

  if(repoIndex < 0) return response.status(400).json({error: "Repository not found"});

  repositories.splice(repoIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", validateUUID, (request, response) => {
  const { id } = request.params;

  const repoIndex = repoIndexById(id);

  if(repoIndex < 0) return response.status(400).json({error: "Repository not found"});

  repositories[repoIndex].likes += 1;

  return response.json(repositories[repoIndex]);
});

function repoIndexById(id) {
  return repositories.findIndex(r => r.id === id);
}

module.exports = app;

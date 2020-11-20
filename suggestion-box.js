require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { connectToDb, getRandomSuggestion, addSuggestion } = require('./db');
const { postMessage, messages } = require('./slack');
const { SECRET_PASSWORD, PORT } = process.env;

const asyncHandler = controller => async (req, res) => {
  try {
    await controller(req, res);
  } catch (err) {
    console.error({
      message: err.message,
      stack: err.stack,
    });
    if (!res.headersSent) {
      res.send(messages.private.oops());
    }
  }
};

const app = express();

(async () => {
  const db = await connectToDb();

  app.use(bodyParser.urlencoded({ extended: true }));

  app.post('/suggestion', asyncHandler(async (req, res) => {
    const userSuggestion = req.body.text;
    if (!userSuggestion) {
      return res.send(messages.private.blankSuggestion());
    }
    await addSuggestion(userSuggestion, db);
    await postMessage(messages.public.newSuggestion());
    return res.send(messages.private.thanks(req.body.user_id));
  }));

  app.post('/draw', asyncHandler(async (req, res) => {
    const password = req.body.text;
    if (password === SECRET_PASSWORD) {
      const suggestion = await getRandomSuggestion(db);
      if (!suggestion) {
        await postMessage(messages.public.noSuggestions(req.body.user_id));
      } else {
        await postMessage(messages.public.gotSuggestion(req.body.user_id, suggestion));
      }
      return res.send(messages.private.getSuggestion());
    }
    return res.send(messages.private.wrongPassword());
  }));

  app.post('/draw-private', asyncHandler(async (req, res) => {
    const password = req.body.text;
    if (password === SECRET_PASSWORD) {
      const suggestion = await getRandomSuggestion(db);
      if (!suggestion) {
        return res.send(messages.private.noSuggestions());
      } else {
        return res.send(messages.private.gotSuggestion(suggestion));
      }
    }
    return res.send(messages.private.wrongPassword());
  }));

  app.post('/suggest-ping', asyncHandler(async (req, res) => {
    return res.send(messages.private.awake());
  }));

  app.listen(PORT);
})();

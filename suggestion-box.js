require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { connectToDb, getRandomSuggestion, addSuggestion } = require('./db');
const { postMessage, messages } = require('./slack');
const { SECRET_PASSWORD } = process.env;

const app = express();

(async () => {
  const db = await connectToDb();

  app.use(bodyParser.urlencoded({ extended: true }));

  app.post('/suggestion', async (req, res) => {
    try {
      const userSuggestion = req.body.text;
      if (userSuggestion === SECRET_PASSWORD) {
        const suggestion = await getRandomSuggestion(db);
        if (!suggestion) {
          await postMessage(messages.public.noSuggestions(req.body.user_id));
        } else {
          await postMessage(messages.public.gotSuggestion(req.body.user_id, suggestion));
        }
        return res.send(messages.private.getSuggestion());
      }
      if (!userSuggestion) {
        return res.send(messages.private.blankSuggestion());
      }
      await addSuggestion(userSuggestion, db);
      await postMessage(messages.public.newSuggestion());
      return res.send(messages.private.thanks(req.body.user_id));
    } catch (err) {
      console.error({
        message: err.message,
        stack: err.stack,
      });
      if (!res.headersSent) {
        res.send(messages.private.oops());
      }
    }
  });

  app.listen(3333);
})();

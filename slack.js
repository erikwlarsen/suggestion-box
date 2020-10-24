const axios = require('axios');

const { SLACK_WATERCOOLER_URL } = process.env;

const postMessage = (text) => axios.post(SLACK_WATERCOOLER_URL, { text }).catch(console.error);
const messages = {
  private: {
    getSuggestion: () => 'Reaching into the box...',
    blankSuggestion: () => 'Be sure to include a suggestion! Whatever your heart desires!',
    thanks: (userId) => `Thanks for the suggestion <@${userId}>!`,
    oops: () => 'Oh no, looks like something went wrong!',
    wrongPassword: () => 'Hmm, that\'s not the right password to draw from the suggestion box.',
  },
  public: {
    noSuggestions: (userId) => `<@${userId}> reached into the Suggestion Box, but there are no suggestions left! Alloy is perfect!`,
    gotSuggestion: (userId, suggestion) => `<@${userId}> reached into the Suggestion Box, and pulled this out:\n${suggestion}`,
    newSuggestion: () => 'Gee whiz, there\'s a new suggestion in the Suggestion Box!',
  },
};

module.exports = { postMessage, messages };

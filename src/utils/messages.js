const getMessageAndTime = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime(),
  };
};

const getlocationAndTime = (username, url) => {
  return {
    username,
    url,
    createdAt: new Date().getTime(),
  };
};

module.exports = {
  getMessageAndTime,
  getlocationAndTime,
};

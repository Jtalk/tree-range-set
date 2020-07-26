module.exports = {
  roots: ["src"],
  testMatch: ["**/?(*.)+(spec).+(ts|tsx|js)"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
};

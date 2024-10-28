import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/src/tests/__mocks__/styleMock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
  moduleDirectories: ["node_modules", "<rootDir>"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        jsx: "react-jsx",
      },
    ],
  },
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["js", "ts", "tsx", "json", "node"],
};

export default config;

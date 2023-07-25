import { configDotenv } from "dotenv";
configDotenv();

const config = {
  dev: {
    MODE: 'dev',
    HOST: "localhost",
    PORT: 3030,
    SECRET: process.env.SOME_SECRET_KEY,
  },
  prod: {
    MODE: 'prod',
    HOST: "localhost",
    PORT: 5050,
    SECRET: process.env.SOME_SECRET_KEY,
  },
};

const chosenConfig = process.env.NODE_ENV in config ? config[process.env.NODE_ENV] : config.dev;

export default chosenConfig;

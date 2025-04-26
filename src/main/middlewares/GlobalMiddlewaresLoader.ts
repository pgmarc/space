import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

const loadGlobalMiddlewares = (app: express.Application) => {
  app.use(express.json());
  app.use(cors());
  app.use(helmet(
    {
      crossOriginResourcePolicy: false // allows loading of files from /public
    }
  ));
  app.use(express.static('public'));
  app.use(express.json({limit: '2mb'}));
  app.use(express.urlencoded({limit: '2mb', extended: true}));
};

export default loadGlobalMiddlewares;

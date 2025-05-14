import type { Server } from 'http';
import { initializeServer, disconnectDatabase } from '../../main/app';
import { Application } from 'express';

let testServer: Server | null = null;
let testApp: Application | null = null;

const getApp = async (): Promise<Server> => {
  if (!testServer) {
    const { server, app } = await initializeServer();
    testServer = server;
    testApp = app;
  }
  return testServer;
};

const useApp = (app?: any) => {
  let appCopy = app;
  if (!app) {
    appCopy = testApp;
  }

  return appCopy;
}

const shutdownApp = async () => {
  if (testServer) {
    await testServer.close();
    await disconnectDatabase();
    testApp = null;
    testServer = null;
  }
};

const getIdType = () => {
  switch (process.env.DATABASE_TECHNOLOGY) {
    case 'mongoDB':
      return String;
    default:
      throw new Error('Unsupported database technology');
  }
};

export { getApp, useApp, shutdownApp, getIdType };

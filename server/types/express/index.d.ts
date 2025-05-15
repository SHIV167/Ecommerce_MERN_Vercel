import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      file?: import('multer').File;
    }
  }
}

export {};

import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { ZodError } from "zod";

function isKnownPrismaError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed.",
      issues: error.flatten()
    });
    return;
  }

  if (isKnownPrismaError(error)) {
    if (error.code === "P2002") {
      res.status(409).json({
        message: "A record with the same unique value already exists."
      });
      return;
    }

    if (error.code === "P2003") {
      res.status(404).json({
        message: "Related record not found or invalid reference provided."
      });
      return;
    }

    if (error.code === "P2025") {
      res.status(404).json({
        message: "Requested record was not found."
      });
      return;
    }
  }

  if (error instanceof Error) {
    res.status(500).json({
      message: "Internal server error.",
      ...(process.env.NODE_ENV !== "production" ? { error: error.message } : {})
    });
    return;
  }

  res.status(500).json({
    message: "Unexpected server error."
  });
}

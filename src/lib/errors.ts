export class AppError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}

export function toErrorMessage(error: unknown) {
  if (error instanceof AppError) {
    return { message: error.message, status: error.status };
  }

  if (error instanceof Error) {
    return { message: error.message, status: 500 };
  }

  return { message: 'Unexpected error', status: 500 };
}
// Custom Error Class to encapsulate Valibot's issues
export class ValidationError extends Error {
   public readonly issues: unknown[];

   constructor(issues: unknown[]) {
      super('Validation failed');
      this.name = 'ValidationError';
      this.issues = issues;

      // Ensure the prototype chain is correct
      Object.setPrototypeOf(this, ValidationError.prototype);
   }
}

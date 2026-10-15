declare module 'bcryptjs' {
  export function compare(data: string, encrypted: string): Promise<boolean>;
  export function hash(data: string, saltOrRounds: string | number): Promise<string>;
  export function hashSync(data: string, saltOrRounds: string | number): string;
  const bcrypt: {
    compare: typeof compare;
    hash: typeof hash;
    hashSync: typeof hashSync;
  };
  export default bcrypt;
}
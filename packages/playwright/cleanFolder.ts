import { rm } from 'fs/promises';
import { resolve } from 'path';

export async function cleanFolder() {
  const directory = resolve(process.cwd(), '../../tests');
  try {
    await rm(directory, { recursive: true, force: true });
  } catch (error) {
    console.error(`❌ Error cleaning the tests directory: ${error}`);
  }
}
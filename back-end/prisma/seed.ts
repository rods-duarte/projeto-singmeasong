import { prisma } from '../src/database.js';

async function main() {
  console.log('seed');
}

main()
  .catch((err) => {
    console.log(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

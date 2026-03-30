import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: './packages/database/prisma/schema.prisma',
  datasource: {
    url: "postgresql://postgres:admin@localhost:5432/dignify?schema=public"
  },
});
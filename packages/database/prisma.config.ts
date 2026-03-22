import { defineConfig } from '@prisma/config';
export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: "postgresql://postgres:admin@localhost:5432/dignify?schema=public",
  }
});

import { defineConfig } from '@prisma/config'

export default defineConfig({
  earlyAccess: true,
  schema: 'packages/database/prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL
  }
})

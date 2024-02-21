import { config } from 'dotenv' // Importa a função config do pacote dotenv para carregar variáveis de ambiente
import { z } from 'zod' // Importa o pacote zod para validação de esquema

// Carrega as variáveis de ambiente do arquivo '.env.test' se estiver em ambiente de teste, caso contrário, carrega do arquivo '.env' padrão
if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

// Define um esquema para validar as variáveis de ambiente necessárias usando zod
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'), // Valida NODE_ENV como um dos valores enumerados, padrão 'production'
  DATABASE_CLIENT: z.enum(['sqlite', 'pg']),
  DATABASE_URL: z.string(), // Valida DATABASE_URL como string
  PORT: z.coerce.number().default(3333), // Valida PORT como número, padrão 3333
})

// Tenta fazer o parsing das variáveis de ambiente de acordo com o esquema definido
const _env = envSchema.safeParse(process.env)

// Verifica se o parsing foi bem-sucedido, caso contrário, exibe um erro e interrompe a execução
if (_env.success === false) {
  console.error('⚠ Invalid environment variables', _env.error.format()) // Exibe os detalhes do erro

  throw new Error('Invalid environment variables') // Lança um erro para interromper a execução
}

export const env = _env.data // Exporta as variáveis de ambiente validadas

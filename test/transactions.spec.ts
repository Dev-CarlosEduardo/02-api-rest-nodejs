import { expect, it, beforeAll, afterAll, describe, beforeEach } from 'vitest' // Importações necessárias para os testes
import { execSync } from 'node:child_process'
import request from 'supertest' // Importação do supertest para testar as requisições HTTP
import { app } from '../src/app' // Importação da aplicação para testar

describe('Transactions routes', () => {
  // Agrupa os testes relacionados às rotas de transações

  beforeAll(async () => {
    await app.ready() // Garante que a aplicação está pronta antes de todos os testes
  })

  afterAll(async () => {
    await app.close() // Fecha a aplicação depois de todos os testes
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all') // Reverte todas as migrações antes de cada teste
    execSync('npm run knex migrate:latest') // Aplica as migrações mais recentes antes de cada teste
  })

  it('should be able to create a new transaction', async () => {
    // Testa a criação de uma nova transação
    await request(app.server)
      .post('/transactions') // Faz uma requisição POST para criar uma nova transação
      .send({
        title: 'New transaction', // Título da transação
        amount: 5000, // Montante da transação
        type: 'credit', // Tipo da transação
      })
      .expect(201) // Espera que a resposta tenha o status 201 (Created)
  })

  it('should be able to list all transactions', async () => {
    // Testa a listagem de todas as transações
    // Cria uma nova transação
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie') // Recupera os cookies da resposta

    // Faz uma requisição GET para listar as transações
    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies) // Define os cookies na requisição
      .expect(200) // Espera que a resposta tenha o status 200 (OK)

    // Valida se a resposta contém a transação criada
    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000,
      }),
    ])
  })

  it('should be able to get a specific transaction', async () => {
    // Testa a obtenção de uma transação específica
    // Cria uma nova transação
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie') // Recupera os cookies da resposta

    // Faz uma requisição GET para listar as transações
    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies) // Define os cookies na requisição
      .expect(200) // Espera que a resposta tenha o status 200 (OK)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    // Faz uma requisição GET para obter uma transação específica
    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies) // Define os cookies na requisição
      .expect(200) // Espera que a resposta tenha o status 200 (OK)

    // Valida se a resposta contém a transação criada
    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000,
      }),
    )
  })

  it('should be able to get the summary', async () => {
    // Testa a obtenção do resumo das transações
    // Cria uma transação de crédito
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Credit transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie') // Recupera os cookies da resposta

    // Cria uma transação de débito
    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies) // Define os cookies na requisição
      .send({
        title: 'Debit transaction',
        amount: 2000,
        type: 'debit',
      })

    // Faz uma requisição GET para obter o resumo das transações
    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies) // Define os cookies na requisição
      .expect(200) // Espera que a resposta tenha o status 200 (OK)

    // Valida se o resumo contém o saldo correto
    expect(summaryResponse.body.summary).toEqual({
      amount: 3000,
    })
  })
})

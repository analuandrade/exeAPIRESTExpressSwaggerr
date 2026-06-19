const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = 3000;

// Middleware para ler JSON no corpo das requisições
app.use(express.json());

// ============================================
// DADOS EM MEMÓRIA (array de alunos)
// ============================================
let alunos = [
  { id: 1, nome: 'Ana Silva', curso: 'Engenharia de Software' },
  { id: 2, nome: 'João Souza', curso: 'Ciência da Computação' }
];

// Função auxiliar para gerar novo ID
function gerarNovoId() {
  if (alunos.length === 0) return 1;
  return Math.max(...alunos.map(aluno => aluno.id)) + 1;
}

// ============================================
// CONFIGURAÇÃO DO SWAGGER
// ============================================
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Alunos',
      version: '1.0.0',
      description: 'API para gerenciar alunos (CRUD completo)'
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor local'
      }
    ]
  },
  apis: ['./index.js'] // Caminho onde estão os comentários @swagger
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ============================================
// ROTAS DA API
// ============================================

/**
 * @swagger
 * /alunos:
 *   get:
 *     summary: Lista todos os alunos
 *     description: Retorna um array com todos os alunos cadastrados
 *     responses:
 *       200:
 *         description: Lista de alunos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nome:
 *                     type: string
 *                   curso:
 *                     type: string
 */
app.get('/alunos', (req, res) => {
  res.status(200).json(alunos);
});

/**
 * @swagger
 * /alunos/{id}:
 *   get:
 *     summary: Busca um aluno pelo ID
 *     description: Retorna os dados de um aluno específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno
 *     responses:
 *       200:
 *         description: Aluno encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nome:
 *                   type: string
 *                 curso:
 *                   type: string
 *       404:
 *         description: Aluno não encontrado
 */
app.get('/alunos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const aluno = alunos.find(a => a.id === id);
  
  if (!aluno) {
    return res.status(404).json({ erro: 'Aluno não encontrado' });
  }
  
  res.status(200).json(aluno);
});

/**
 * @swagger
 * /alunos:
 *   post:
 *     summary: Cadastra um novo aluno
 *     description: Adiciona um aluno à lista
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - curso
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Maria Oliveira"
 *               curso:
 *                 type: string
 *                 example: "Sistemas de Informação"
 *     responses:
 *       201:
 *         description: Aluno criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nome:
 *                   type: string
 *                 curso:
 *                   type: string
 *       400:
 *         description: Dados inválidos (nome ou curso faltando)
 */
app.post('/alunos', (req, res) => {
  const { nome, curso } = req.body;
  
  if (!nome || !curso) {
    return res.status(400).json({ erro: 'Os campos nome e curso são obrigatórios' });
  }
  
  const novoAluno = {
    id: gerarNovoId(),
    nome,
    curso
  };
  
  alunos.push(novoAluno);
  res.status(201).json(novoAluno);
});

/**
 * @swagger
 * /alunos/{id}:
 *   put:
 *     summary: Atualiza um aluno existente
 *     description: Substitui os dados de um aluno pelo ID informado
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - curso
 *             properties:
 *               nome:
 *                 type: string
 *               curso:
 *                 type: string
 *     responses:
 *       200:
 *         description: Aluno atualizado com sucesso
 *       404:
 *         description: Aluno não encontrado
 */
app.put('/alunos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, curso } = req.body;
  const alunoIndex = alunos.findIndex(a => a.id === id);
  
  if (alunoIndex === -1) {
    return res.status(404).json({ erro: 'Aluno não encontrado' });
  }
  
  if (!nome || !curso) {
    return res.status(400).json({ erro: 'Os campos nome e curso são obrigatórios' });
  }
  
  alunos[alunoIndex] = { id, nome, curso };
  res.status(200).json(alunos[alunoIndex]);
});

/**
 * @swagger
 * /alunos/{id}:
 *   delete:
 *     summary: Remove um aluno
 *     description: Deleta um aluno da lista pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do aluno
 *     responses:
 *       204:
 *         description: Aluno removido com sucesso (sem conteúdo)
 *       404:
 *         description: Aluno não encontrado
 */
app.delete('/alunos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const alunoIndex = alunos.findIndex(a => a.id === id);
  
  if (alunoIndex === -1) {
    return res.status(404).json({ erro: 'Aluno não encontrado' });
  }
  
  alunos.splice(alunoIndex, 1);
  res.status(204).send(); // 204 = No Content
});

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📚 Documentação Swagger disponível em http://localhost:${PORT}/api-docs`);
});
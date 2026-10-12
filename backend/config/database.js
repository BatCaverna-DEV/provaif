import 'dotenv/config'
import mariadb from 'mariadb'
import { Sequelize } from 'sequelize'

const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORTA = Number(process.env.DB_PORTA) || 3306
const DB_USUARIO = process.env.DB_USUARIO || 'root'
const DB_SENHA = process.env.DB_SENHA || ''
const DB_NOME = process.env.DB_NOME || 'provaif'

const sequelize = new Sequelize(DB_NOME, DB_USUARIO, DB_SENHA, {
    host: DB_HOST,
    port: DB_PORTA,
    dialect: 'mariadb',
    logging: process.env.DB_LOG === 'true' ? console.log : false,
    timezone: '-03:00',
    define: {
        underscored: true,
        freezeTableName: true,
    },
})

// Cria o banco de dados caso ele ainda não exista.
// É preciso uma conexão sem banco selecionado, pois o Sequelize exige que ele exista.
async function criarBanco() {
    const conexao = await mariadb.createConnection({
        host: DB_HOST,
        port: DB_PORTA,
        user: DB_USUARIO,
        password: DB_SENHA,
    })
    try {
        await conexao.query(
            `CREATE DATABASE IF NOT EXISTS \`${DB_NOME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        )
    } finally {
        await conexao.end()
    }
}

// Cria o banco (se necessário), testa a conexão e gera as tabelas dos models.
// Os models devem ser importados antes desta chamada para serem sincronizados.
export async function conectarBanco() {
    await criarBanco()
    await sequelize.authenticate()
    await sequelize.sync({ alter: process.env.DB_ALTER === 'true' })
    console.log(`Banco de dados "${DB_NOME}" conectado em ${DB_HOST}:${DB_PORTA}`)
}

export default sequelize

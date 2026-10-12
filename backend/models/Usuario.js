import { DataTypes } from 'sequelize'
import bcrypt from 'bcryptjs'
import sequelize from '../config/database.js'

export const STATUS_USUARIO = {
    INATIVO: 0,
    ATIVO: 1,
}

const SALT_ROUNDS = 10

const Usuario = sequelize.define('Usuario', {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    nome: DataTypes.STRING(100),
    email: DataTypes.STRING(100),
    username: DataTypes.STRING(100),
    password: DataTypes.STRING(250),
    status: {
        type: DataTypes.INTEGER,
        defaultValue: STATUS_USUARIO.ATIVO,
    },
}, {
    tableName: 'usuarios',
    timestamps: false,
    indexes: [
        { name: 'usuarios_email_unique', unique: true, fields: ['email'] },
        { name: 'usuarios_username_unique', unique: true, fields: ['username'] },
    ],
    // A senha nunca é retornada nas consultas, a não ser com Usuario.scope('comSenha')
    defaultScope: {
        attributes: { exclude: ['password'] },
    },
    scopes: {
        // Usar um scope nomeado descarta o defaultScope, então basta não excluir nada
        comSenha: { attributes: { exclude: [] } },
    },
    hooks: {
        // Guarda sempre o hash da senha, nunca o texto puro
        async beforeSave(usuario) {
            if (usuario.changed('password')) {
                usuario.password = await bcrypt.hash(usuario.password, SALT_ROUNDS)
            }
        },
    },
})

Usuario.prototype.conferirSenha = function (senha) {
    return bcrypt.compare(senha, this.password)
}

// Garante que a senha não vaze mesmo quando o objeto foi carregado com o scope 'comSenha'
Usuario.prototype.toJSON = function () {
    const { password, ...dados } = this.get()
    return dados
}

export default Usuario

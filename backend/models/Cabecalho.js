import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Cabecalho = sequelize.define('Cabecalho', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    instituicao: DataTypes.STRING(100),
    campos: DataTypes.STRING(100),
    curso: DataTypes.STRING(100),
    disciplina: DataTypes.STRING(100),
    professor: DataTypes.STRING(100),
    turma: DataTypes.STRING(100),
    data: DataTypes.DATEONLY,
    instrucoes: DataTypes.TEXT('long'),
}, {
    tableName: 'cabecalhos',
    timestamps: false,
})

export default Cabecalho

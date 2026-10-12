import Usuario from './Usuario.js'
import Questao from './Questao.js'
import Alternativa from './Alternativa.js'
import Avaliacao from './Avaliacao.js'
import AvaliacaoQuestao from './AvaliacaoQuestao.js'
import Cabecalho from './Cabecalho.js'

// Usuário 1:N Questões
Usuario.hasMany(Questao, { foreignKey: { name: 'usuarioId', field: 'usuarios_id', allowNull: false }, as: { singular: 'questao', plural: 'questoes' }, onDelete: 'RESTRICT' })
Questao.belongsTo(Usuario, { foreignKey: { name: 'usuarioId', field: 'usuarios_id', allowNull: false }, as: 'usuario' })

// Usuário 1:N Avaliações
Usuario.hasMany(Avaliacao, { foreignKey: { name: 'usuarioId', field: 'usuarios_id', allowNull: false }, as: { singular: 'avaliacao', plural: 'avaliacoes' }, onDelete: 'RESTRICT' })
Avaliacao.belongsTo(Usuario, { foreignKey: { name: 'usuarioId', field: 'usuarios_id', allowNull: false }, as: 'usuario' })

// Questão 1:N Alternativas
Questao.hasMany(Alternativa, { foreignKey: { name: 'questaoId', field: 'questoes_id', allowNull: false }, as: { singular: 'alternativa', plural: 'alternativas' }, onDelete: 'CASCADE' })
Alternativa.belongsTo(Questao, { foreignKey: { name: 'questaoId', field: 'questoes_id', allowNull: false }, as: 'questao' })

// Avaliação 1:N Cabeçalhos
Avaliacao.hasMany(Cabecalho, { foreignKey: { name: 'avaliacaoId', field: 'avaliacoes_id', allowNull: false }, as: { singular: 'cabecalho', plural: 'cabecalhos' }, onDelete: 'CASCADE' })
Cabecalho.belongsTo(Avaliacao, { foreignKey: { name: 'avaliacaoId', field: 'avaliacoes_id', allowNull: false }, as: 'avaliacao' })

// Avaliação N:N Questões, via avaliacoes_questoes
Avaliacao.belongsToMany(Questao, { through: AvaliacaoQuestao, foreignKey: { name: 'avaliacaoId', field: 'avaliacoes_id', allowNull: false }, otherKey: { name: 'questaoId', field: 'questoes_id', allowNull: false }, as: { singular: 'questao', plural: 'questoes' } })
Questao.belongsToMany(Avaliacao, { through: AvaliacaoQuestao, onDelete: 'RESTRICT', foreignKey: { name: 'questaoId', field: 'questoes_id', allowNull: false }, otherKey: { name: 'avaliacaoId', field: 'avaliacoes_id', allowNull: false }, as: { singular: 'avaliacao', plural: 'avaliacoes' } })

// Acesso direto à tabela associativa (ex.: consultar/alterar os pontos)
Avaliacao.hasMany(AvaliacaoQuestao, { foreignKey: { name: 'avaliacaoId', field: 'avaliacoes_id', allowNull: false }, as: { singular: 'item', plural: 'itens' }, onDelete: 'CASCADE' })
AvaliacaoQuestao.belongsTo(Avaliacao, { foreignKey: { name: 'avaliacaoId', field: 'avaliacoes_id', allowNull: false }, as: 'avaliacao' })
Questao.hasMany(AvaliacaoQuestao, { foreignKey: { name: 'questaoId', field: 'questoes_id', allowNull: false }, as: { singular: 'item', plural: 'itens' }, onDelete: 'RESTRICT' })
AvaliacaoQuestao.belongsTo(Questao, { foreignKey: { name: 'questaoId', field: 'questoes_id', allowNull: false }, as: 'questao' })

export { Usuario, Questao, Alternativa, Avaliacao, AvaliacaoQuestao, Cabecalho }

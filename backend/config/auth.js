import 'dotenv/config'

const SEGREDO_DESENVOLVIMENTO = 'provaif-segredo-somente-para-desenvolvimento'

if (!process.env.JWT_SEGREDO) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Defina JWT_SEGREDO no .env antes de rodar em produção.')
    }
    console.warn('[auth] JWT_SEGREDO não definido: usando um segredo de desenvolvimento. Não use assim em produção.')
}

export const JWT_SEGREDO = process.env.JWT_SEGREDO || SEGREDO_DESENVOLVIMENTO

// Formato aceito pelo jsonwebtoken: '8h', '30m', '7d'...
export const JWT_EXPIRA_EM = process.env.JWT_EXPIRA_EM || '8h'

import knex from 'knex';
import path from 'path';

// __dirname sempre retorna o campo do diretorio do arquivo que esta executando ele

const connection = knex({
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, 'database.sqlite'),
  },
  useNullAsDefault: true,
});

export default connection;
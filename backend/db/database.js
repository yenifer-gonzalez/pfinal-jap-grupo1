// Configuración de la base de datos

// TODO: ACA VAS VOS YENIFER

const database = {
  query: async (sql, params) => {
    console.log(' Database query (placeholder):', sql, params);
    // para hacer
    return { rows: [], affectedRows: 0 };
  },
  
  connect: async () => {
    console.log('✅ Database connected (placeholder)');
    // para hacer
  },
  
  disconnect: async () => {
    console.log(' Database disconnected (placeholder)');
    // para hacer
  }
};

module.exports = database;
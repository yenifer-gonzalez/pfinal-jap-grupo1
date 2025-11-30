const bcrypt = require('bcryptjs');

async function run() {
  const plain = 'test123';
  const hash = await bcrypt.hash(plain, 10);

  console.log('Contraseña en texto plano:', plain);
  console.log('Hash para guardar en la BD:', hash);
}

run().catch(console.error);

import bcrypt from 'bcryptjs';

async function hashPassword() {
  try {
    const password = 'Yigor3535-*';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log('Generated hash:', hash);
    return hash;
  } catch (error) {
    console.error('Error generating hash:', error);
    throw error;
  }
}

hashPassword();
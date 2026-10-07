// Política de contraseñas (RF-015 esc.4 / RNF):
// mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número.
const validarPassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valida: false, mensaje: 'La contraseña es obligatoria.' };
  }
  if (password.length < 8) {
    return { valida: false, mensaje: 'La contraseña debe tener al menos 8 caracteres.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valida: false, mensaje: 'La contraseña debe incluir al menos una mayúscula.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valida: false, mensaje: 'La contraseña debe incluir al menos una minúscula.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valida: false, mensaje: 'La contraseña debe incluir al menos un número.' };
  }
  return { valida: true };
};

module.exports = validarPassword;

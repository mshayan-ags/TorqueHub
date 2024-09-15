const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

// One JWKS client per jwksUri, reused across requests — jwks-rsa already
// caches individual keys internally, this just avoids re-creating the
// client (and its cache) on every login attempt.
const clientsByJwksUri = new Map();

function getJwksClient(jwksUri) {
  if (!clientsByJwksUri.has(jwksUri)) {
    clientsByJwksUri.set(jwksUri, jwksClient({ jwksUri, cache: true, rateLimit: true }));
  }
  return clientsByJwksUri.get(jwksUri);
}

function getSigningKey(client, kid) {
  return new Promise((resolve, reject) => {
    client.getSigningKey(kid, (err, key) => {
      if (err) return reject(err);
      resolve(key.getPublicKey());
    });
  });
}

// Verifies an Azure AD / Azure AD B2C id_token: fetches the signing key
// matching the token's `kid` from the tenant's JWKS endpoint, then checks
// signature, issuer, audience and expiry. Shared by AdminSSO.js (regular
// Azure AD) and UserSSO.js (Azure AD B2C) since both are plain OIDC id_tokens
// that only differ in which tenant/policy issued them.
async function verifyAzureAdToken(token, { jwksUri, issuer, audience }) {
  if (!token) {
    throw new Error("Missing token");
  }

  const decoded = jwt.decode(token, { complete: true });
  const kid = decoded?.header?.kid;
  if (!kid) {
    throw new Error("Invalid token: missing key id");
  }

  const client = getJwksClient(jwksUri);
  const publicKey = await getSigningKey(client, kid);

  return jwt.verify(token, publicKey, {
    algorithms: ["RS256"],
    issuer,
    audience,
  });
}

module.exports = { verifyAzureAdToken };

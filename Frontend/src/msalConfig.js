// Azure AD B2C config for customer-facing "Continue with Microsoft" sign-in.
// REACT_APP_MSAL_AUTHORITY must be the full B2C policy authority, e.g.
// https://<tenant>.b2clogin.com/<tenant>.onmicrosoft.com/<policyName> — not
// a regular Azure AD tenant URL. knownAuthorities is derived from it since
// B2C requires the host to be explicitly allow-listed.
const authority = process.env.REACT_APP_MSAL_AUTHORITY;

export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_MSAL_CLIENT_ID,
    authority,
    knownAuthorities: authority ? [new URL(authority).hostname] : [],
    redirectUri: process.env.REACT_APP_MSAL_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
};

export const loginRequest = {
  scopes: ["openid", "profile"],
};

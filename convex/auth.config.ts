export default {
  providers: [
    {
      type: "customJwt",
      issuer: "https://shoo.dev",
      jwks: "https://shoo.dev/.well-known/jwks.json",
      algorithm: "ES256",
      applicationID: "origin:https://www.vibecodingtutorial.de",
    },
  ],
};

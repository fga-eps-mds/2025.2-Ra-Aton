# Autenticação — Endpoint /login

POST /login

Request body (application/json):

{
  "email": "user@example.com",
  "senha": "senha123"
}

Responses:

- 200 OK
{
  "token": "<jwt>",
  "user": {
    "id": "...",
    "name": "...",
    "profileType": "jogador",
    "email": "..."
  }
}

- 400 Bad Request
{ "message": "Campos ausentes." }

- 401 Unauthorized
{ "message": "E-mail ou senha incorretos." }

- 500 Internal Server Error
{ "message": "Erro interno no servidor." }

Notes:
- The JWT payload contains `id` and `profileType` and has expiration defined by the `JWT_EXPIRATION` env var (default 1h).
- Ensure `JWT_SECRET` and `DATABASE_URL` are set in the environment before starting the server.
- To protect private routes use the `authMiddleware` which looks for `Authorization: Bearer <token>` header.

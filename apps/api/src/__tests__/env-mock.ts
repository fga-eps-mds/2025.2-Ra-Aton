// Mocka variáveis de ambiente para testes
process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";
process.env.JWT_SECRET = "test_jwt_secret";
process.env.JWT_EXPIRES_IN = "1h";

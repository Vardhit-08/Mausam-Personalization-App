import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../docs/swagger.json' with { type: 'json' };

const router = Router();

// Serve raw JSON spec first so swaggerUi doesn't catch it
router.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  return res.send(swaggerDocument);
});

// Serve interactive Swagger UI documentation
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument));

export default router;


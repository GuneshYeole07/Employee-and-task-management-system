import { Router } from 'express';
import * as c from '../controllers/employee.controller.js';
import { validate, validateIdParam } from '../middleware/validate.js';
import { employeeListQuery, employeeOptionsQuery, employeeSchema } from '../validators/employee.validator.js';

const router = Router();
router.get('/', validate(employeeListQuery, 'query'), c.list);
router.get('/options', validate(employeeOptionsQuery, 'query'), c.options);
router.post('/', validate(employeeSchema), c.create);
router.get('/:id', validateIdParam, c.get);
router.put('/:id', validateIdParam, validate(employeeSchema), c.update);
router.delete('/:id', validateIdParam, c.remove);
export default router;

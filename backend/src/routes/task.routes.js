import { Router } from 'express';
import * as c from '../controllers/task.controller.js';
import { rejectProtectedTaskFields, validate, validateIdParam } from '../middleware/validate.js';
import { statusSchema, taskListQuery, taskSchema } from '../validators/task.validator.js';

const router = Router();
router.get('/', validate(taskListQuery, 'query'), c.list);
router.get('/export', validate(taskListQuery, 'query'), c.exportCsv);
router.post('/', rejectProtectedTaskFields, validate(taskSchema), c.create);
router.get('/:id', validateIdParam, c.get);
router.put('/:id', validateIdParam, rejectProtectedTaskFields, validate(taskSchema), c.update);
router.put('/:id/status', validateIdParam, validate(statusSchema), c.updateStatus);
router.delete('/:id', validateIdParam, c.remove);
export default router;

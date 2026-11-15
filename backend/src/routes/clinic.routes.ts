import { Router } from 'express';
import { clinicController } from '../controllers/clinic.controller.js';

const router = Router();

router.get('/', (req, res, next) => clinicController.listClinics(req, res, next));
router.get('/slots', (req, res, next) => clinicController.getSlots(req, res, next));
router.get('/:id', (req, res, next) => clinicController.getClinicById(req, res, next));

export default router;


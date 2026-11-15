"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clinic_controller_js_1 = require("../controllers/clinic.controller.js");
const router = (0, express_1.Router)();
router.get('/', (req, res, next) => clinic_controller_js_1.clinicController.listClinics(req, res, next));
router.get('/slots', (req, res, next) => clinic_controller_js_1.clinicController.getSlots(req, res, next));
router.get('/:id', (req, res, next) => clinic_controller_js_1.clinicController.getClinicById(req, res, next));
exports.default = router;

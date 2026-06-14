import express from 'express';
import { protect } from '../controllers/authController.js';
import {
  setWorkingHours,
  getWorkingHours,
  updateDaySchedule
} from '../controllers/workingHoursController.js';

const workingHoursRouter = express.Router();

workingHoursRouter.use(protect);

workingHoursRouter.route('/')
  .post(setWorkingHours)   
  .get(getWorkingHours);   

workingHoursRouter.patch('/:day', updateDaySchedule); 

export default workingHoursRouter;
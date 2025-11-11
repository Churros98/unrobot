import { load_robot_from_url } from '../robot';

load_robot_from_url('./tests/robot.json').then((loadedRobot) => {
  console.log('Robot loaded successfully:', loadedRobot);
}).catch((error) => {
  console.error('Error loading robot:', error);
});
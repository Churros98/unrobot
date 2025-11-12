import {test} from '@jest/globals';

import { load_robot } from '../robot'
import robot_data from './robot.json'

const json_string = JSON.stringify(robot_data)

test('load_robot loads a robot from JSON string', () => {
  const robot = load_robot(json_string)
  if (robot.information.name !== 'robot_arm') {
    throw new Error('Robot name does not match expected value')
  }

  if (robot.rootJoint.joints.length !== 1) {
    throw new Error('Root joint should have 1 child')
  }
})
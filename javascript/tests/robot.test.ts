import { expect, test } from 'vitest'
import { load_robot } from '../robot'
import robot_data from '../../robot.json'

const json_string = JSON.stringify(robot_data)

test('load_robot loads a robot from JSON string', () => {
  const robot = load_robot(json_string)

  expect(robot.information.name).toBe('robot_arm')
  expect(robot.rootJoint.joints.length).toBe(1)
})
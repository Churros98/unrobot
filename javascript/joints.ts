import { Robot, JointNode, JointsDescriptor } from './robot.t'

// Create a tree structure of JointNodes from the robot description
// @param description The robot description
// @returns The root JointNode of the robot
export function create_joints_tree(joints_descriptor: JointsDescriptor): JointNode {
  const joints = Object.entries(joints_descriptor)

  // Find the root joint (the one with is_root = true)
  const rootJoints = joints.find(([, joint]) => joint.is_root)
  if (!rootJoints) {
    throw new Error('No root joint found in robot description')
  }

  // Create the root JointNode
  const rootNode: JointNode = {
    name: rootJoints[0],
    angle: { deg: 0 },
    constraint: rootJoints[1].constraint,
    origin: rootJoints[1].origin,
    parent: undefined,
    joints: [],
  }

  const jointNodes = new Map<string, JointNode>()

  // Create a JointNode for each joint in the description
  joints.forEach(([jointName, joint]) => {
    if (jointNodes.has(jointName)) {
      throw new Error(`Joint ${jointName} exists multiple times`)
    }

    jointNodes.set(jointName, {
      name: jointName,
      angle: { deg: 0 },
      constraint: joint.constraint,
      origin: joint.origin,
      parent: undefined,
      joints: [],
    })
  })

  // Link the JointNodes together based on the linked_to property in the description
  jointNodes.forEach((jointNode) => {
    const linked_to = joints_descriptor[jointNode.name].linked_to
    if (linked_to) {
      linked_to.forEach((linkedJointName) => {
        const linkedJointNode = jointNodes.get(linkedJointName)
        if (!linkedJointNode) {
          throw new Error(`Linked joint ${linkedJointName} not found in description`)
        }

        linkedJointNode.parent = jointNode
        jointNode.joints.push(linkedJointNode)
      })
    }
  })

  // Populate the rootNode joints
  rootJoints[1].linked_to?.forEach((linkedJointName) => {
    const linkedJointNode = jointNodes.get(linkedJointName)
    if (!linkedJointNode) {
      throw new Error(`Linked joint ${linkedJointName} not found in description`)
    }

    rootNode.joints.push(linkedJointNode)
  })

  return rootNode
}

// Find a joint by name in the robot's joint hierarchy
// @param robot The Robot containing the joint hierarchy
// @param name The name of the joint to find
// @returns The JointNode with the specified name, or undefined if not found
export function find_joint_by_name(robot: Robot, name: string): JointNode | undefined {
  function recursive_search(joint: JointNode): JointNode | undefined {
    if (joint.name === name) {
      return joint
    }

    for (const childJoint of joint.joints) {
      const result = recursive_search(childJoint)
      if (result) {
        return result
      }
    }

    return undefined
  }

  return recursive_search(robot.rootJoint)
}

// Get the list of joints from the root to the specified joint
// @param joint The JointNode to trace back to the root
// @returns An array of JointNodes from the root to the specified joint
export function list_of_joints_from_root(joint: JointNode): JointNode[] {
  const joints: JointNode[] = []
  let currentJoint: JointNode | undefined = joint

  while (currentJoint) {
    joints.push(currentJoint)
    currentJoint = currentJoint.parent
  }

  return joints.reverse()
}
import { list_of_joints_from_root } from './joints'
import { JointNode, Position, PositionSchema } from './robot.t'

/**
* Calculate the Euclidean distance between two joints based on their origin positions
*  @param jointA The first JointNode
*  @param jointB The second JointNode
*  @returns The distance between the two joints
*/
export function distance_between_joints(jointA: JointNode, jointB: JointNode): number {
  const dx = jointB.origin.x - jointA.origin.x
  const dy = jointB.origin.y - jointA.origin.y
  const dz = jointB.origin.z - jointA.origin.z

  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
* Calculate the point of a joint in 3D space
* @param joint The JointNode we want to calculate the position for (from the root)
* @param angle Angle list of each joint
* @returns The 3D position of the joint
*/
export function kinematic_angles_to_position(joint: JointNode, angles: number[]): Position {
    // Build the list of joints from root to the target joint
    const list_of_joints = list_of_joints_from_root(joint)
   
    let position: Position = { x: 0, y: 0, z: 0 }
    let currentAngleIndex = 0

    // Apply the transformations of each joint in the list
    for (const j of list_of_joints) {
        const angle = angles[currentAngleIndex] || 0

        // Apply rotation around the specified axis
        if (j.rotation) {
            const rad = (angle * Math.PI) / 180
            const cosA = Math.cos(rad)
            const sinA = Math.sin(rad)

            let rotatedX = j.origin.x
            let rotatedY = j.origin.y
            let rotatedZ = j.origin.z

            if (j.rotation.x) {
                // Rotate around X axis
                rotatedY = j.origin.y * cosA - j.origin.z * sinA
                rotatedZ = j.origin.y * sinA + j.origin.z * cosA
            } else if (j.rotation.y) {
                // Rotate around Y axis
                rotatedX = j.origin.x * cosA + j.origin.z * sinA
                rotatedZ = -j.origin.x * sinA + j.origin.z * cosA
            } else if (j.rotation.z) {
                // Rotate around Z axis
                rotatedX = j.origin.x * cosA - j.origin.y * sinA
                rotatedY = j.origin.x * sinA + j.origin.y * cosA
            }

            rotatedX += position.x
            rotatedY += position.y
            rotatedZ += position.z

            position = PositionSchema.parse({
                x: rotatedX,
                y: rotatedY,
                z: rotatedZ
            })
        }

        currentAngleIndex++
    }

    return position
}

/**
* Inverse kinematics using a simple gradient descent approach
* @param joint The end-effector JointNode we want to reach the target position
* @param target The target Position we want the end-effector to reach
* @param maxIterations Maximum number of iterations for the algorithm
* @param learningRate The step size for each iteration
* @returns The list of joint angles that move the end-effector close to the target position
*/
export function inverse_kinematics(
    joint: JointNode,
    target: Position,
    maxIterations = 100,
    learningRate = 0.5
): number[] {
    // Start with initial angles as zeros
    let angles = list_of_joints_from_root(joint).map(() => 0);

    // Retrieve the ordered list of joints (same order as FK)
    const joints = list_of_joints_from_root(joint);

    const epsilon = 0.001; // acceptable spatial precision

    for (let iter = 0; iter < maxIterations; iter++) {

        // Current end-effector position
        const currentPos = kinematic_angles_to_position(joint, angles);

        // Error vector
        const errX = target.x - currentPos.x;
        const errY = target.y - currentPos.y;
        const errZ = target.z - currentPos.z;

        const distError = Math.sqrt(errX * errX + errY * errY + errZ * errZ);

        if (distError < epsilon) break;

        // Loop through each joint angle
        for (let i = 0; i < angles.length; i++) {

            const savedAngle = angles[i];

            // Small step for numerical gradient
            const delta = 0.5; // degrees
            angles[i] = savedAngle + delta;

            // Compute FK for modified angle
            const posDelta = kinematic_angles_to_position(joint, angles);

            // Numerical gradient
            const grad =
                ((posDelta.x - currentPos.x) * errX +
                 (posDelta.y - currentPos.y) * errY +
                 (posDelta.z - currentPos.z) * errZ) / delta;

            // Update angle by gradient descent
            let newAngle = savedAngle - learningRate * grad;

            // -------------------------
            // APPLY JOINT CONSTRAINTS
            // -------------------------

            const jointConstraints = joints[i].constraint;

            if (jointConstraints) {
                const minAngle = jointConstraints.min;
                const maxAngle = jointConstraints.max;

                // Clamp new angle
                if (newAngle < minAngle) newAngle = minAngle;
                if (newAngle > maxAngle) newAngle = maxAngle;
            }

            angles[i] = newAngle;
        }
    }

    return angles;
}
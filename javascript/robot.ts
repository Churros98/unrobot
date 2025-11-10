import { Robot, RobotDescriptorSchema, RobotSchema } from './robot.t'
import { create_joints_tree } from './joints'

// Load robot description from a URL
// The URL should point to a JSON file conforming to the RobotDescriptorSchema
// @param url - The URL of the robot description JSON file
// @returns A Promise that resolves to a Robot object
export async function load_robot_from_url(url: string): Promise<Robot> {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Failed to load robot description from ${url}: ${response.statusText}`)
    }

    const data = await response.json()
    return load_robot(JSON.stringify(data))
}

// Load robot description from a JSON string
// The JSON string should conform to the RobotDescriptorSchema
// @param data - The JSON string of the robot description
// @returns A Robot object
export function load_robot(data: string) {
    const descriptor = RobotDescriptorSchema.parse(JSON.parse(data))
    const rootJoint = create_joints_tree(descriptor.joints)

    return RobotSchema.parse(
        {
            information: descriptor.information,
            rootJoint: rootJoint
        }
    )
}

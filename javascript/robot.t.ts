import { z } from 'zod'

//////////////////////////////////////////
// Basic types
//////////////////////////////////////////

const AngleSchema = z.object({
  deg: z.number().min(-180).max(180),
})

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
})

const RotationAxisSchema = z.object({
  x: z.boolean().default(false),
  y: z.boolean().default(false),
  z: z.boolean().default(false),
})

const ConstraintSchema = z.object({
  min: z.number().min(-180).max(180),
  max: z.number().min(-180).max(180),
}).refine((data: z.infer<typeof ConstraintSchema>) => data.min < data.max, {
  message: 'min must be less than max',
})

const InformationSchema = z.object({
  name: z.string().min(1),
  version: z.number().optional().default(1.0),
  description: z.string().optional().default("Robot"),
  author: z.string().optional().default("Unknown"),
})

export type Angle = z.infer<typeof AngleSchema>
export type Constraint = z.infer<typeof ConstraintSchema>
export type Position = z.infer<typeof PositionSchema>
export type RotationAxis = z.infer<typeof RotationAxisSchema>
export type Information = z.infer<typeof InformationSchema>

//////////////////////////////////////////
// Description of the robot (In file)
//////////////////////////////////////////

const JointDescSchema = z.object({
  id: z.number().min(0).optional(),
  is_root: z.boolean().default(false),
  constraint: ConstraintSchema.optional().default({ min: -180, max: 180 }),
  rotation: RotationAxisSchema.optional(),
  origin: PositionSchema.optional().default({ x: 0, y: 0, z: 0 }),
  linked_to: z.array(z.string().min(1)).optional().default([]),
})

const JointsDesc = z.record(z.string(), JointDescSchema)

export const RobotDescriptorSchema = z.object({
  information: InformationSchema,
  joints: JointsDesc,
})

export type JointsDescriptor = z.infer<typeof JointsDesc>
export type RobotDescriptor = z.infer<typeof RobotDescriptorSchema>

//////////////////////////////////////////
// Robot structure in memory
//////////////////////////////////////////

const JointNodeSchema = z.object({
    name: z.string().min(1),
    origin: PositionSchema.optional().default({ x: 0, y: 0, z: 0 }),
    angle: AngleSchema,
    constraint: ConstraintSchema,
    rotation: RotationAxisSchema.optional(),
    get parent() {
      return z.optional(JointNodeSchema)
    },
    get joints() {
      return z.array(JointNodeSchema)
    },
  })

export const RobotSchema = z.object({
  information: InformationSchema,
  rootJoint: JointNodeSchema,
})

export type Robot = z.infer<typeof RobotSchema>
export type JointNode = z.infer<typeof JointNodeSchema>
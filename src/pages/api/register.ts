import { NextApiRequest, NextApiResponse } from 'next'
import { keystoneContext } from 'keystone/context'
import cuid from 'cuid'
import { z } from 'zod'

const SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || 'Turnstile'

const registerSchema = z
  .object({
    turnstileRes: z.string(),
    firstName: z.string(),
    surname: z.string(),
    phone: z
      .string()
      .length(10, { message: 'Please enter a valid 10 digit phone number' })
      .regex(/^\d+$/, {
        message: 'Please enter a valid 10 digit phone number',
      }),
    suburb: z.string(),
    postcode: z
      .number()
      .min(1000, { message: 'Please enter a valid postcode' })
      .max(9999, { message: 'Please enter a valid postcode' }),
    streetAddress: z.string(),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' }),
    passwordConfirmation: z.string(),
  })
  .superRefine(({ passwordConfirmation, password }, ctx) => {
    if (passwordConfirmation !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
      })
    }
  })
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const form = new URLSearchParams()

  const zParse = registerSchema.safeParse(req.body)

  if (!zParse.success) return res.status(400).json({ error: 'Invalid data' })
  const { data } = zParse
  form.append('secret', SECRET_KEY)
  form.append('response', data.turnstileRes)
  form.append('remoteip', req.headers['x-forwarded-for'] as string)

  const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
  const result = await fetch(url, {
    body: form,
    method: 'POST',
  })

  const outcome = await result.json()

  if (!outcome.success) {
    return res.status(403).json({ error: 'Verification failed' })
  }
  const existingUser = await keystoneContext.sudo().db.User.count({
    where: { email: { equals: data.email } },
  })
  if (existingUser > 0) {
    return res.status(400).json({ error: 'Error Creating User' })
  }
  try {
    const user = await keystoneContext.sudo().db.User.createOne({
      data: {
        email: data.email,
        password: data.password,
        subjectId: cuid(),
        provider: 'credentials',
        account: {
          create: {
            firstName: data.firstName,
            surname: data.surname,
            phone: data.phone,
            suburb: data.suburb,
            postcode: data.postcode,
            streetAddress: data.streetAddress,
          },
        },
      },
    })
    if (!user || !user.id || user.email !== data.email) {
      return res.status(400).json({ error: 'Error Creating User' })
    }
    return res.status(200).json({ success: true })
  } catch (e) {
    console.error(e)
    return res.status(400).json({ error: 'Error Creating User' })
  }
}
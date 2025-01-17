import { getSessionContext } from 'keystone/context'
import { getQBClient } from 'lib/intuit'
import { NextApiRequest, NextApiResponse } from 'next'
import OAuthClient from 'intuit-oauth'
import Tokens from 'csrf'

const csrf = new Tokens()
function generateAntiForgery() {
  const secret = process.env.NEXTAUTH_SECRET!
  return csrf.create(secret)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const context = await getSessionContext({ req, res })
  if (!context.session || context.session?.data.role !== 'ADMIN') {
    return res.status(403).send('Not authorized')
  } else {
    const qbo = await getQBClient({ context })

    return res.redirect(
      qbo.authorizeUri({
        scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
        state: generateAntiForgery(),
      })
    )
  }
}

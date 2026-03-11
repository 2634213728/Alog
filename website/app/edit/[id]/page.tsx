import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EditForm from './EditForm'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPage({ params }: Props) {
  const { id } = await params

  const log = await prisma.log.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  })

  if (!log) notFound()

  return <EditForm log={log} />
}

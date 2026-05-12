#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { Command } from 'commander'

const program = new Command()

program.name('kingermeat').description('Backend utility CLI').version('1.0.0')

program.command('serve').action(async () => {
  await import('../index.js')
})

program.command('seed').action(() => {
  execSync('npx prisma db seed', {
    stdio: 'inherit',
  })
})

program.command('health').action(async () => {
  const res = await fetch('http://localhost:3000/api/health')
  console.log(await res.json())
})

program.command('stats').action(async () => {
  const res = await fetch('http://localhost:3000/api/stats')
  console.log(await res.json())
})

program.command('doctor').action(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/health')
    console.log(`API: ${res.status}`)
  } catch {
    console.log('API: offline')
  }

  try {
    execSync('npx prisma validate', { stdio: 'ignore' })
    console.log('Prisma: ok')
  } catch {
    console.log('Prisma: fail')
  }
})

program
  .command('debug')
  .argument('<type>')
  .action(async (type) => {
    try {
      const res = await fetch(`http://localhost:3000/api/debug/${type}`)

      console.log(`${res.status} ${res.statusText}`)
    } catch {
      console.log('Server offline')
      process.exit(1)
    }
  })

program.parse()

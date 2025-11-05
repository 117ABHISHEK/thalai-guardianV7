/*
  Migration script: migrate-admins.js
  Usage:
    node migrate-admins.js --dry-run      # Lists admin users and shows what would change
    node migrate-admins.js --apply        # Actually updates admin -> hospital
    node migrate-admins.js --apply=role=bloodbank  # Update admin -> bloodbank (optional)

  NOTE: This script reads MONGODB_URI from the environment (.env). Run from the repo root or set MONGODB_URI.
*/

const mongoose = require('mongoose')
const User = require('../models/User')
const dotenv = require('dotenv')
const argv = require('minimist')(process.argv.slice(2))

// Try loading .env from common locations
dotenv.config()
dotenv.config({ path: './.env' })
dotenv.config({ path: '../.env' })

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in environment. Set the MONGODB_URI env var or ensure a .env with MONGODB_URI is present in server/ or project root.')
  process.exit(1)
}

async function run() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

  const dryRun = !!argv['dry-run'] || !!argv['dryrun'] || !argv['apply'] && !argv['apply-role'] && !argv['apply=role']
  // default target role
  const targetRole = (argv['apply-role'] || argv['apply'] && argv['apply'].toString().startsWith('role=') ? argv['apply'].toString().split('=')[1] : null) || argv['role'] || argv['to'] || 'hospital'

  console.log('Migration: admin ->', targetRole)
  console.log(dryRun ? 'Performing dry-run (no changes will be written).' : 'Applying changes...')

  const admins = await User.find({ role: 'admin' }).select('name email role _id')

  if (admins.length === 0) {
    console.log('No admin users found. Nothing to do.')
    process.exit(0)
  }

  console.log('Found admin users:')
  admins.forEach((u) => console.log(` - ${u._id} | ${u.name} | ${u.email}`))

  if (dryRun) {
    console.log('\nDry run complete. To apply the changes run:')
    console.log('  node migrate-admins.js --apply')
    console.log('Or to map to bloodbank:')
    console.log('  node migrate-admins.js --apply=role=bloodbank')
    process.exit(0)
  }

  // Apply changes
  const res = await User.updateMany({ role: 'admin' }, { $set: { role: targetRole } })
  console.log(`Updated ${res.nModified || res.modifiedCount} users to role='${targetRole}'.`)

  await mongoose.disconnect()
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration error:', err)
    process.exit(1)
  })

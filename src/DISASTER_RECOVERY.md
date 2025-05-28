## Emergency Data Restoration
1. Identify latest encrypted backup in `./backups`
2. Decrypt: `openssl enc -d -aes-256-cbc -in backup.enc -out backup.sql`
3. Restore: `psql -U [user] -d [db] -f backup.sql`

## Failover Protocol
- Primary DB down → Switch to replica within 5 mins
- Full outage → Restore from backup within 1 hour
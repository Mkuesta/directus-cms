# Directus CMS Backend

Docker-based Directus CMS setup for WordPress template e-commerce platform.

## Quick Start

### 1. Start Directus

```bash
cd directus-backend
docker-compose up -d
```


### 3. Check Status

```bash
# View logs
docker-compose logs -f directus

# Check if running
docker-compose ps

# Stop Directus
docker-compose down

# Restart Directus
docker-compose restart
```

## Database

Directus connects to the existing Supabase PostgreSQL database with a separate `directus` schema, keeping Strapi data intact.

## File Storage

Currently configured for local storage. To use Supabase S3 storage:

1. Get S3 credentials from Supabase Dashboard → Settings → API
2. Update `.env`:
   ```env
   STORAGE_LOCATIONS=supabase
   STORAGE_SUPABASE_KEY=<your-key>
   STORAGE_SUPABASE_SECRET=<your-secret>
   ```
3. Restart: `docker-compose restart`

## Troubleshooting

### Container won't start
```bash
docker-compose down
docker-compose up -d
docker-compose logs -f
```

### Database connection issues
- Verify Supabase credentials in `.env`
- Check if `directus` schema exists in PostgreSQL
- Ensure Supabase allows connections from your IP

### Reset everything
```bash
docker-compose down -v
docker-compose up -d
```

## Production Deployment

When ready for production:

1. Update `PUBLIC_URL` in `.env` to your domain
2. Use strong passwords
3. Enable HTTPS
4. Configure Supabase S3 storage
5. Set up backups

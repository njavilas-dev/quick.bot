docker-pull:
	docker pull ghcr.io/urbiport/quick.bot:builder-feat-QB-1063
	docker pull ghcr.io/urbiport/quick.bot:viewer-feat-QB-1063

run-builder:
	docker run --env-file /home/sarys/urbiport/quick.bot/.env.railway  -it  ghcr.io/urbiport/quick.bot:builder-feat-QB-1063 bash

run-viewer:
	docker run --env-file /home/sarys/urbiport/quick.bot/.env.railway  -it  ghcr.io/urbiport/quick.bot:viewer-feat-QB-1063 bash

build-builder:
	docker build \
	--build-arg SCOPE=builder \
	--build-arg NEXT_PUBLIC_VIEWER_URL=https://viewer.quick.bot \
	--build-arg NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME=quick-bot-viewer \
	--build-arg NEXT_PUBLIC_SMTP_FROM=noreply@quick.bot \
	--build-arg NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_51Q5tf7GBX1iL5M9Ba3AKnWW6lGKmtoX386IbDUECrzUHOUjq9sbuEtqVZjyxRYyfFcMrUaxXThpaleHc7w5QNBzX00bWMaAubp \
	--build-arg NEXT_PUBLIC_GOOGLE_API_KEY=AIzaSyAGhFI6BV789ThrvCL3lWgvc54nw5UnNDw \
	--build-arg NEXT_PUBLIC_GIPHY_API_KEY=iRKS4i8JZhKu1WfRbcSLqtEnsx8p3F1o \
	--build-arg DATABASE_URL="postgresql://neondb_owner:npg_T2gBmjLnAV9O@ep-orange-breeze-acv2hxhv-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
	--build-arg ENCRYPTION_SECRET="H+KbL/OFrqbEuDy/1zX8bsPG+spXri3S" \
	--build-arg NEXTAUTH_URL=https://app.quick.bot \
	-t ghcr.io/urbiport/quick.bot:builder-feat-QB-1063 \
	-f Dockerfile .
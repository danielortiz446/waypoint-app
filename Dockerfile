FROM node:22-alpine
WORKDIR /app
COPY . .
ENV NODE_ENV=production
ENV PORT=8787
ENV WAYPOINT_DATA_FILE=/data/waypoint-sync-data.json
RUN mkdir -p /data
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -q -O - http://127.0.0.1:8787/health || exit 1
CMD ["node","server.js"]

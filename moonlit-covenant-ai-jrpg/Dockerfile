FROM node:22-alpine
WORKDIR /app
# 运行时需要的全部内容：server.mjs 会 import game/、cards/、scenario/，静态页面与主线章节在 public/。
# 新增顶层目录时记得在这里补 COPY；test/deploy-contents.test.mjs 会按这些 COPY 行拼出镜像内容并实际启动一次。
COPY package.json ./
COPY server.mjs ./
COPY game ./game
COPY cards ./cards
COPY scenario ./scenario
COPY public ./public
# 存档写在 /app/data/saves.json（PERSIST=0 可关闭；要跨容器保留就挂卷：-v moonlit-data:/app/data）。
# 以非 root 的 node 用户运行，data/ 预先建好并交给它（命名卷首次创建时会沿用这个属主）。
RUN mkdir -p /app/data && chown node:node /app/data
# 作者核#12（B2/B3）：这个版本不公开，商店、钻石与召唤保留，演示工具（免费补充）保持开启；要关掉就 -e DEMO_TOOLS=0。
ENV NODE_ENV=production DEMO_TOOLS=1 HOST=0.0.0.0 PORT=4173
USER node
EXPOSE 4173
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || 4173) + '/api/health').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
CMD ["node", "server.mjs"]

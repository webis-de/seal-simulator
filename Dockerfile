ARG seal
ARG playwright=v1.15.0-focal

# Playwright Docker documentation: https://playwright.dev/docs/docker/
# Playwright tags: https://mcr.microsoft.com/v2/playwright/tags/list
# Playwright Dockerfile: https://github.com/microsoft/playwright/blob/master/utils/docker/Dockerfile.focal
FROM mcr.microsoft.com/playwright:${playwright}
RUN npm install -g seal-simulator@${seal}


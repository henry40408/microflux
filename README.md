# Microflux

> A compact application that perfectly suits my reading workflow

[![Casual Maintenance Intended](https://casuallymaintained.tech/badge.svg)](https://casuallymaintained.tech/)
![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/henry40408/microflux/.github%2Fworkflows%2Fworkflow.yaml)
![GitHub](https://img.shields.io/github/license/henry40408/microflux)
![GitHub tag (latest SemVer pre-release)](https://img.shields.io/github/v/tag/henry40408/microflux)

## WARNING: Authentication or authorization not included

Since this project is in its very early stages, it currently lacks an
authentication or authorization mechanism. If you plan to host it, you should
consider securing it with tools like [Authelia](https://www.authelia.com) or [Authentik](https://goauthentik.io).

## Getting started

```bash
cp .env.example .env
$EDITOR .env # add your configuration
docker run --rm -it --env-file .env -p 3000:3000 ghcr.io/henry40408/microflux:latest
```

## License

MIT

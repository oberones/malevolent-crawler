# Multi-platform index verified against Docker Hub on 2026-10-24 (AMD64 and ARM64).
FROM nginx:1.30.6-alpine@sha256:47928bf67eb62a1863cb08d9ecb52d3e704304ba614eaee17884204677702951

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY index.html LICENSE /srv/malevolent-crawler/
COPY assets/ /srv/malevolent-crawler/assets/

USER 101:101
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/index.html || exit 1

# Immutable configuration needs none of the upstream entrypoint rewrite scripts.
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]

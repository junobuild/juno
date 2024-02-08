# Use this with
#
#  docker build -t mission_control .
#
# The docker image. To update, run `docker pull ubuntu` locally, and update the
# sha256:... accordingly.
FROM ubuntu@sha256:626ffe58f6e7566e00254b638eb7e0f3b11d4da9675088f4781a50ae288f3322 as deps

ENV TZ=UTC

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && \
    apt -yq update && \
    apt -yqq install --no-install-recommends curl ca-certificates \
        build-essential pkg-config libssl-dev llvm-dev liblmdb-dev clang cmake

ENV NODE_VERSION=18.13.0

# Install node
RUN curl --fail -sSf https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version

# Install Rust and Cargo in /opt
ENV RUSTUP_HOME=/opt/rustup \
    CARGO_HOME=/cargo \
    PATH=/cargo/bin:$PATH

COPY ./docker ./docker
COPY ./rust-toolchain.toml ./rust-toolchain.toml

RUN ./docker/bootstrap

# Pre-build all cargo dependencies. Because cargo doesn't have a build option
# to build only the dependecies, we pretend that our project is a simple, empty
# `lib.rs`. When we COPY the actual files we make sure to `touch` lib.rs so
# that cargo knows to rebuild it with the new content.
COPY Cargo.lock .
COPY Cargo.toml .
COPY src/console/Cargo.toml src/console/Cargo.toml
COPY src/observatory/Cargo.toml src/observatory/Cargo.toml
COPY src/orbiter/Cargo.toml src/orbiter/Cargo.toml
COPY src/mission_control/Cargo.toml src/mission_control/Cargo.toml
COPY src/satellite/Cargo.toml src/satellite/Cargo.toml
COPY src/libs/macros/Cargo.toml src/libs/macros/Cargo.toml
COPY src/libs/satellite/Cargo.toml src/libs/satellite/Cargo.toml
COPY src/libs/shared/Cargo.toml src/libs/shared/Cargo.toml
COPY src/libs/utils/Cargo.toml src/libs/utils/Cargo.toml
ENV CARGO_TARGET_DIR=/cargo_target
RUN mkdir -p src/console/src \
    && touch src/console/src/lib.rs \
    && mkdir -p src/observatory/src \
    && touch src/observatory/src/lib.rs \
    && mkdir -p src/orbiter/src \
    && touch src/orbiter/src/lib.rs \
    && mkdir -p src/mission_control/src \
    && touch src/mission_control/src/lib.rs \
    && mkdir -p src/satellite/src \
    && touch src/satellite/src/lib.rs \
    && mkdir -p src/libs/macros/src \
    && touch src/libs/macros/src/lib.rs \
    && mkdir -p src/libs/satellite/src \
    && touch src/libs/satellite/src/lib.rs \
    && mkdir -p src/libs/shared/src \
    && touch src/libs/shared/src/lib.rs \
    && mkdir -p src/libs/utils/src \
    && touch src/libs/utils/src/lib.rs \
    && ./docker/build --only-dependencies \
    && rm -rf src

FROM deps as build_mission_control

COPY . .

RUN touch src/console/src/lib.rs
RUN touch src/observatory/src/lib.rs
RUN touch src/orbiter/src/lib.rs
RUN touch src/mission_control/src/lib.rs
RUN touch src/satellite/src/lib.rs
RUN touch src/libs/macros/src/lib.rs
RUN touch src/libs/satellite/src/lib.rs
RUN touch src/libs/shared/src/lib.rs
RUN touch src/libs/utils/src/lib.rs
RUN npm ci

RUN ./docker/build
RUN sha256sum /mission_control.wasm.gz

FROM deps as build_satellite

COPY . .

RUN touch src/console/src/lib.rs
RUN touch src/observatory/src/lib.rs
RUN touch src/orbiter/src/lib.rs
RUN touch src/mission_control/src/lib.rs
RUN touch src/satellite/src/lib.rs
RUN touch src/libs/macros/src/lib.rs
RUN touch src/libs/satellite/src/lib.rs
RUN touch src/libs/shared/src/lib.rs
RUN touch src/libs/utils/src/lib.rs

RUN ./docker/build --satellite
RUN sha256sum /satellite.wasm.gz

FROM deps as build_console

COPY . .

RUN touch src/console/src/lib.rs
RUN touch src/observatory/src/lib.rs
RUN touch src/orbiter/src/lib.rs
RUN touch src/mission_control/src/lib.rs
RUN touch src/satellite/src/lib.rs
RUN touch src/libs/macros/src/lib.rs
RUN touch src/libs/satellite/src/lib.rs
RUN touch src/libs/shared/src/lib.rs
RUN touch src/libs/utils/src/lib.rs

RUN ./docker/build --console
RUN sha256sum /console.wasm.gz

FROM deps as build_observatory

COPY . .

RUN touch src/console/src/lib.rs
RUN touch src/observatory/src/lib.rs
RUN touch src/orbiter/src/lib.rs
RUN touch src/mission_control/src/lib.rs
RUN touch src/satellite/src/lib.rs
RUN touch src/libs/macros/src/lib.rs
RUN touch src/libs/satellite/src/lib.rs
RUN touch src/libs/shared/src/lib.rs
RUN touch src/libs/utils/src/lib.rs

RUN ./docker/build --observatory
RUN sha256sum /observatory.wasm.gz

FROM deps as build_orbiter

COPY . .

RUN touch src/console/src/lib.rs
RUN touch src/observatory/src/lib.rs
RUN touch src/orbiter/src/lib.rs
RUN touch src/mission_control/src/lib.rs
RUN touch src/satellite/src/lib.rs
RUN touch src/libs/macros/src/lib.rs
RUN touch src/libs/satellite/src/lib.rs
RUN touch src/libs/shared/src/lib.rs
RUN touch src/libs/utils/src/lib.rs

RUN ./docker/build --orbiter
RUN sha256sum /orbiter.wasm.gz

FROM scratch AS scratch_mission_control
COPY --from=build_mission_control /mission_control.wasm.gz /

FROM scratch AS scratch_satellite
COPY --from=build_satellite /satellite.wasm.gz /

FROM scratch AS scratch_console
COPY --from=build_console /console.wasm.gz /

FROM scratch AS scratch_observatory
COPY --from=build_observatory /observatory.wasm.gz /

FROM scratch AS scratch_orbiter
COPY --from=build_orbiter /orbiter.wasm.gz /

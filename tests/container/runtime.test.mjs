import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import test from "node:test";

const id = process.env.CONTAINER_ID;
if (!id)
  throw new Error(
    "CONTAINER_ID must identify the production Compose container.",
  );

/** Query the owned container without interpolating shell commands. */
function docker(...args) {
  return execFileSync("docker", args, {
    encoding: "utf8",
    timeout: 30_000,
  }).trim();
}

// Inspect actual Docker settings rather than assuming the YAML was applied correctly.
test("production hardening and image health are active", () => {
  const [container] = JSON.parse(docker("inspect", id));
  assert.equal(container.Config.User, "101:101");
  assert.equal(container.State.Health.Status, "healthy");
  assert.equal(container.HostConfig.ReadonlyRootfs, true);
  assert.deepEqual(container.HostConfig.CapDrop, ["ALL"]);
  assert.ok(
    container.HostConfig.SecurityOpt.includes("no-new-privileges:true"),
  );
  assert.equal(container.HostConfig.PidsLimit, 64);
  assert.equal(container.HostConfig.RestartPolicy.Name, "unless-stopped");
  assert.equal(container.HostConfig.LogConfig.Type, "json-file");
  assert.deepEqual(container.HostConfig.LogConfig.Config, {
    "max-size": "10m",
    "max-file": "3",
  });
  assert.equal(
    container.HostConfig.Tmpfs["/tmp"],
    "rw,noexec,nosuid,nodev,size=16m,mode=1777",
  );
  assert.equal(
    container.Mounts.length,
    0,
    "no host files or persistent volumes",
  );
  assert.deepEqual(container.Config.Entrypoint, ["nginx"]);
  assert.equal(
    container.NetworkSettings.Ports["8080/tcp"][0].HostIp,
    "127.0.0.1",
  );
  assert.deepEqual(Object.keys(container.NetworkSettings.Networks), [
    process.env.MALEVOLENT_CRAWLER_NETWORK,
  ]);
  assert.equal(docker("exec", id, "id", "-u"), "101");
  assert.equal(docker("exec", id, "id", "-g"), "101");
  docker("exec", id, "nginx", "-t");
});

// The static document root must contain all shipped assets and no repository/config files.
test("document root is exactly the public allowlist", () => {
  const expected = ["index.html", "LICENSE"];
  for (const entry of readdirSync("assets", {
    recursive: true,
    withFileTypes: true,
  })) {
    assert.ok(
      !entry.isSymbolicLink(),
      "runtime assets must not escape their directory",
    );
    if (entry.isFile()) expected.push(`${entry.parentPath}/${entry.name}`);
  }
  const actual = docker(
    "exec",
    id,
    "find",
    "/srv/malevolent-crawler",
    "-type",
    "f",
  )
    .split("\n")
    .map(
      // Normalize only the known image root before comparing complete file inventories.
      (path) => path.replace("/srv/malevolent-crawler/", ""),
    );
  assert.deepEqual(actual.sort(), expected.sort());
});

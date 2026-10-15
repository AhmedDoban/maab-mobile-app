const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const LEVELS = ["none", "patch", "minor", "major"];

const git = (cmd) => execSync(`git ${cmd}`, { cwd: ROOT, encoding: "utf8" });

const readJson = (file) =>
  JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
const writeJson = (file, data) =>
  fs.writeFileSync(path.join(ROOT, file), `${JSON.stringify(data, null, 2)}\n`);

const IGNORED = [
  /\.md$/,
  /^\.gitignore$/,
  /^\.githooks\//,
  /^\.vscode\//,
  /^\.claude\//,
  /^scripts\/bump-version\.js$/,
  /^package-lock\.json$/,
];

const staged = () =>
  git("diff --cached --name-status")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [status, ...files] = line.split("\t");
      return { status: status[0], file: files[files.length - 1] };
    });

function addedDependencies() {
  try {
    const before = JSON.parse(git("show HEAD:package.json"));
    const after = readJson("package.json");
    return Object.keys(after.dependencies ?? {}).some(
      (name) => !(name in (before.dependencies ?? {})),
    );
  } catch {
    return false;
  }
}

function detectLevel(changes) {
  const forced = process.env.BUMP;
  if (forced && LEVELS.includes(forced)) return forced;

  const relevant = changes.filter(
    ({ file }) => !IGNORED.some((re) => re.test(file)),
  );
  if (!relevant.length) return "none";

  const minor =
    addedDependencies() ||
    relevant.some(
      ({ status, file }) =>
        status === "A" &&
        /^(src\/app\/|src\/features\/[^/]+\/[^_][^/]*\.tsx$|modules\/[^/]+\/index\.ts$)/.test(
          file,
        ),
    );
  return minor ? "minor" : "patch";
}

function bump(version, level) {
  const [major, minor, patch] = version.split(".").map(Number);
  if (level === "major") return `${major + 1}.0.0`;
  if (level === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function versionAlreadyChanged() {
  try {
    const before = JSON.parse(git("show HEAD:app.json")).expo.version;
    return before !== readJson("app.json").expo.version;
  } catch {
    return false;
  }
}

function main() {
  const changes = staged();
  if (!changes.length || versionAlreadyChanged()) return;
  const level = detectLevel(changes);
  if (level === "none") return;

  const app = readJson("app.json");
  const next = bump(app.expo.version, level);
  app.expo.version = next;
  writeJson("app.json", app);

  const pkg = readJson("package.json");
  pkg.version = next;
  writeJson("package.json", pkg);

  const files = ["app.json", "package.json"];
  if (fs.existsSync(path.join(ROOT, "package-lock.json"))) {
    const lock = readJson("package-lock.json");
    lock.version = next;
    if (lock.packages?.[""]) lock.packages[""].version = next;
    writeJson("package-lock.json", lock);
    files.push("package-lock.json");
  }

  git(`add ${files.join(" ")}`);
  console.log(`version ${level}: ${next}`);
}

main();

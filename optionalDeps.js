const fs = require('fs');

const packages = fs.readdirSync('./packages').filter(n => !n.startsWith('.'))

for (const package of packages) {
  const pkgPath = `./packages/${package}/package.json`;
  const pkg = require(pkgPath);

  const optDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.optionalDependencies
  }


  delete pkg.dependencies;
  delete pkg.devDependencies;
  pkg.optionalDependencies = optDeps;

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}


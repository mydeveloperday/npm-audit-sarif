npm-audit-sarif is a Node based tool for transforming npm audit json output to sarif format.

The purpose is for importing the npm audit vulnerabilities into static analysis tools such as SonarQube for the tracking of npm-audit issues.

```
   npm install npm-audit-sarif
```

To see a list of options run

```
npx npm-audit-sarif


Usage: npm-audit-sarif [options] <filename>

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -o, --output   Output filename                                        [string]
  -r, --root     Root directory                                         [string]

Not enough non-option arguments: got 0, need at least 1
```

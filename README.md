# stratrack

This repository hosts the source for a multi-language FX strategy development platform.

```
- api       C# / Azure Functions backend
- frontend  Vite + React frontend
- backend   Legacy FastAPI implementation (to be deprecated)
- infrastructure Infrastructure as code scripts
- docs      Documentation
- libs      Internal libraries and packages
```

The `libs` directory contains reusable packages. The `mt4-interpreter` package is a
scaffolding project for parsing and executing MQL4 scripts.

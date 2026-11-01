# dojo-app

Mini app Angular 21 del Dojo Frontend Angular: catálogo de almacenes contra el
[dojo-api](https://github.com/VlV-515/dojo_backend_go/tree/main/practica/dojo-api)
del dojo de backend. La guía completa está en [`../README.md`](../README.md) y en
los módulos `04` a `14`.

```bash
nvm use                 # Node 22 (lee ../../.nvmrc)
npm ci
npm run start:mock      # sin backend: http://localhost:4200
npm start               # con el dojo-api corriendo en :1099 (usa proxy.conf.json)
npm test                # base en verde
npm run lint
npm run build
npm run reto:a          # en rojo hasta que lo resuelvas (b, c igual)
```

Token del dojo-api en local: `dojo-local-inseguro`.

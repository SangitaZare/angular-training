# Angular Training

Twelve days of Angular, each day a self-contained app in its own folder. The progression
runs from components and templates through to routing, forms, state, testing and a final
dashboard project.

Each `day-*/` folder is a complete Angular workspace with its own `README.md`,
`package.json` and `angular.json`.

## The days

| Day | Topic |
|---|---|
| [day-1](day-1/) | Angular architecture and components |
| [day-2](day-2/) | Templates and pipes |
| [day-3](day-3/) | Services and dependency injection |
| [day-4](day-4/) | Routing |
| [day-5](day-5/) | Forms — template-driven and reactive |
| [day-6](day-6/) | State management with NgRx |
| [day-7](day-7/) | Performance and UI/UX |
| [day-8](day-8/) | Advanced components |
| [day-9](day-9/) | Authentication and HTTP interceptors |
| [day-10](day-10/) | Testing |
| [day-11](day-11/) | QR code generation and language translation |
| [day-12](day-12/) | Mini-project — Angular dashboard |

## Running one

Each day is independent, so install and serve from inside its folder:

```bash
cd day-4
npm install
ng serve
```

The app is then served at `http://localhost:4200`.

Day 12 pulls the earlier topics together into a single dashboard — start there if you only
want to see one.

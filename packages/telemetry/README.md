# @ferrlabs/telemetry

Grafana Faro setup shared by FerrLabs fronts. One copy of the opt-out logic, the
redaction and the payload walk, instead of one per app.

## Install

```bash
pnpm add @ferrlabs/telemetry
```

`@angular/core` (`^22`) is an optional peer, needed only for `@ferrlabs/telemetry/angular`.

## Usage

```ts
import { initTelemetry } from '@ferrlabs/telemetry';

initTelemetry({
  appName: 'my-app',
  collectorUrl: 'https://rum.ferrlabs.com/collect',
  capabilityPaths: [[/(\/s\/)[^/?#\s]+/g, '$1:token']],
});
```

```ts
import { provideTelemetryErrorHandler } from '@ferrlabs/telemetry/angular';

export const appConfig: ApplicationConfig = {
  providers: [provideTelemetryErrorHandler()],
};
```

## Behaviour

- Nothing is sent on `localhost` (including `*.localhost`) or loopback addresses, or when the browser sends Do Not Track or
  Global Privacy Control.
- Faro runs with `captureConsole: false` and session tracking off.
- Every string in an item (meta and payload) goes through `capabilityPaths`, then `redactText`.
  String, array and object fields whose name looks like a secret (`password`, `apiKey`,
  `authorization`, ...) are replaced by `*` whatever their value.
- The walk fails closed: if an item cannot be scrubbed, it is dropped.
- `environment` is derived from the hostname: `.dev.ferrlabs` is `dev`, `.ferrlabs` is `interne`,
  `.home` is `home`, anything else is `prod`.

## Exports

| Entry                         | Exports                                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `@ferrlabs/telemetry`         | `initTelemetry`, `isOptedOut`, `isLocalHostname`, `redactText`, `redactItem`, `environmentFromHostname` |
| `@ferrlabs/telemetry/angular` | `provideTelemetryErrorHandler`, `TelemetryErrorHandler`                                                 |

`capabilityPaths` is a list of `[RegExp, replacement]` pairs for URLs that carry a capability in
the path (share links, reset tokens) and so cannot be caught by key name.

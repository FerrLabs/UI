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
  capabilityPaths: [[/(\/s\/)[^/?#\s]+/g, '$1:token']],
  dropSessionMeta: false,
});
```

`collectorUrl` is optional and defaults to `https://rum.ferrlabs.com/collect`. Pass it to send
to another collector:

```ts
initTelemetry({ appName: 'my-app', collectorUrl: 'https://rum.example.com/collect' });
```

`environment` overrides the hostname-derived Faro environment. An empty string counts as unset:

```ts
initTelemetry({ appName: 'my-app', environment: window.__ENV__?.RUM_ENV });
```

`enabled` defaults to `true`. When `false`, `initTelemetry` returns immediately and Faro is not
initialised, for apps that have no collector configured in some builds:

```ts
initTelemetry({ appName: 'my-app', enabled: COLLECTOR_URL.length > 0 });
```

`isConsentRefused` is evaluated at init next to Do Not Track, Global Privacy Control and the local
hostname check. Faro is not initialised when it returns `true` or throws. After init, apps that
track consent changes call `pauseTelemetry()` and `resumeTelemetry()`:

```ts
initTelemetry({ appName: 'my-app', isConsentRefused: () => readConsent() === 'refused' });
window.addEventListener('consent-refused', pauseTelemetry);
window.addEventListener('consent-accepted', resumeTelemetry);
```

Both are no-ops when Faro is not initialised and never throw.

```ts
import { provideTelemetryErrorHandler } from '@ferrlabs/telemetry/angular';

export const appConfig: ApplicationConfig = {
  providers: [provideTelemetryErrorHandler()],
};
```

Report a bootstrap failure before any Angular `ErrorHandler` exists:

```ts
import { reportError } from '@ferrlabs/telemetry';

bootstrapApplication(App, appConfig).catch((error: unknown) => {
  reportError(error);
  console.error(error);
});
```

`reportError(value)` pushes an `Error` as is and wraps anything else into one. It is a no-op when
Faro is not initialised (opt-out, localhost, SSR) and never throws.

## Behaviour

- Nothing is sent on `localhost` (including `*.localhost`) or loopback addresses, or when the browser sends Do Not Track (`navigator.doNotTrack` or `window.doNotTrack` set to `1` or `yes`) or
  Global Privacy Control.
- Faro runs with `captureConsole: false` and session tracking off.
- Every string in an item (meta and payload) goes through `capabilityPaths`, then `redactText`.
  The item is never mutated: `redactItem` returns a scrubbed copy, built from a single read of
  each property. Dates are kept, other non-plain objects are replaced by their redacted string
  form, and shared or cyclic containers keep their shape.
- Fields whose name looks like a secret (`password`, `apiKey`, `authorization`, `*_code`,
  `*_state`, ...) are masked whatever their value: strings, numbers and non-plain values become
  `*`, and objects and arrays are kept but every key and every non-container value inside is
  masked. A number under a metric-looking name (`tokenCount`, `ttl`, `durationMs`, ...) is kept.
  The secret check is order independent: a container reachable under a secret name from
  anywhere in the item is treated as secret wherever it is also reachable.
- Other object keys go through `redactText` too. Keys that collide after redaction are suffixed
  `*#2`, `*#3`, ...
- `meta.session` (the Faro session object at the root of `meta`) is kept as is when it is a plain
  object, so session correlation keeps working. With `dropSessionMeta: true` it is removed from
  the item instead.
- `redactText` has no regex lookbehind (Safari before 16.4), bounds its input to 16 KB and its
  output to 2 KB, and runs in under 250 ms on adversarial input.
- The walk fails closed: if an item cannot be scrubbed (a getter throws, a value cannot be
  stringified), it is dropped.
- `environment` is derived from the hostname: `.dev.ferrlabs` is `dev`, `.ferrlabs` is `interne`,
  `.home` is `home`, anything else is `prod`.

## Exports

| Entry                         | Exports                                                                                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@ferrlabs/telemetry`         | `initTelemetry`, `reportError`, `pauseTelemetry`, `resumeTelemetry`, `isOptedOut`, `isLocalHostname`, `redactText`, `redactItem`, `environmentFromHostname` |
| `@ferrlabs/telemetry/angular` | `provideTelemetryErrorHandler`, `TelemetryErrorHandler`                                                                                                     |

`redactItem(item, capabilityPaths?, { dropSessionMeta? })` returns the scrubbed copy, or `null`
when the item must be dropped.

`capabilityPaths` is a list of `[RegExp, replacement]` pairs for URLs that carry a capability in
the path (share links, reset tokens) and so cannot be caught by key name.

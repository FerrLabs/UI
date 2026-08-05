import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type StatusLevel = 'up' | 'degraded' | 'down' | 'unknown';

export interface StatusBucket {
  readonly at: string;
  readonly status: StatusLevel;
  readonly uptimePct?: number;
  readonly sampleCount?: number;
}

interface Bar {
  readonly status: StatusLevel;
  readonly title: string;
}

const LABEL: Record<StatusLevel, string> = {
  up: 'Operational',
  degraded: 'Degraded',
  down: 'Down',
  unknown: 'No data',
};

@Component({
  selector: 'flr-status-bars',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-bars.component.html',
  styleUrl: './status-bars.component.css',
})
export class StatusBarsComponent {
  readonly buckets = input<readonly StatusBucket[]>([]);
  readonly slots = input(90);
  readonly label = input('Availability');
  readonly locale = input<string | undefined>(undefined);

  protected readonly bars = computed<Bar[]>(() => {
    const slots = Math.max(1, this.slots());
    const source = this.buckets().slice(-slots);
    const padding = slots - source.length;
    const locale = this.locale();

    const empty: Bar = { status: 'unknown', title: LABEL.unknown };
    const padded: Bar[] = Array.from({ length: padding }, () => empty);

    for (const bucket of source) {
      padded.push({ status: bucket.status, title: this.titleFor(bucket, locale) });
    }
    return padded;
  });

  protected readonly summary = computed(() => {
    const counted = this.buckets().filter((b) => b.status !== 'unknown');
    if (counted.length === 0) {
      return `${this.label()}: no data`;
    }
    const up = counted.filter((b) => b.status === 'up').length;
    const pct = ((up / counted.length) * 100).toFixed(2);
    return `${this.label()}: ${pct}% operational over the last ${counted.length} intervals`;
  });

  private titleFor(bucket: StatusBucket, locale: string | undefined): string {
    const when = new Date(bucket.at);
    const stamp = Number.isNaN(when.getTime()) ? bucket.at : when.toLocaleString(locale);
    const parts = [stamp, LABEL[bucket.status]];
    if (bucket.status !== 'unknown' && bucket.uptimePct !== undefined) {
      parts.push(`${bucket.uptimePct.toFixed(2)}% uptime`);
    }
    return parts.join(' · ');
  }
}

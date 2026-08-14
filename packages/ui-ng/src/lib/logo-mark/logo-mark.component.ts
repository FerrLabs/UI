import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type ProductSlug =
  | 'ferrflow'
  | 'ferrvault'
  | 'ferrtrack'
  | 'ferrgrowth'
  | 'ferragents'
  | 'ferrfleet'
  | 'ferrlens'
  | 'ferrlabs';

@Component({
  selector: 'flr-logo-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 32 32" aria-hidden="true">
      @switch (product()) {
        @case ('ferrflow') {
          <g>
            <line x1="6" y1="16" x2="14" y2="16" [attr.stroke]="accent()" stroke-width="1.6" />
            <line x1="18" y1="16" x2="24" y2="10" [attr.stroke]="accent()" stroke-width="1.6" />
            <line x1="18" y1="16" x2="24" y2="22" [attr.stroke]="accent()" stroke-width="1.6" />
            <circle cx="4" cy="16" r="3" [attr.fill]="accent()" />
            <circle cx="16" cy="16" r="3" [attr.fill]="accent()" />
            <circle cx="26" cy="10" r="3" [attr.fill]="accent()" opacity="0.6" />
            <circle cx="26" cy="22" r="3" [attr.fill]="accent()" opacity="0.6" />
          </g>
        }
        @case ('ferrvault') {
          <g>
            <circle cx="16" cy="17" r="9" [attr.stroke]="accent()" stroke-width="2" fill="none" />
            <circle cx="16" cy="16" r="3" [attr.fill]="accent()" />
            <rect x="14.5" y="17" width="3" height="7" [attr.fill]="accent()" />
          </g>
        }
        @case ('ferrtrack') {
          <g>
            <circle
              cx="16"
              cy="16"
              r="11"
              [attr.stroke]="accent()"
              stroke-width="1"
              fill="none"
              opacity="0.3"
            />
            <circle
              cx="16"
              cy="16"
              r="7"
              [attr.stroke]="accent()"
              stroke-width="1.4"
              fill="none"
              opacity="0.55"
            />
            <circle cx="16" cy="16" r="3" [attr.fill]="accent()" />
            <line
              x1="16"
              y1="16"
              x2="26"
              y2="6"
              [attr.stroke]="accent()"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </g>
        }
        @case ('ferrgrowth') {
          <g>
            <line
              x1="16"
              y1="28"
              x2="16"
              y2="14"
              [attr.stroke]="accent()"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path d="M 16 18 Q 8 16, 6 8 Q 14 8, 16 14" [attr.fill]="accent()" />
            <path d="M 16 14 Q 24 12, 26 4 Q 18 4, 16 12" [attr.fill]="accent()" opacity="0.65" />
          </g>
        }
        @case ('ferrlabs') {
          <g>
            <text
              x="3"
              y="24"
              font-family="DM Mono, ui-monospace, monospace"
              font-size="9"
              [attr.fill]="accent()"
              opacity="0.5"
            >
              [
            </text>
            <text
              x="16"
              y="24"
              text-anchor="middle"
              font-family="Fraunces, Georgia, serif"
              font-weight="900"
              font-size="15"
              [attr.fill]="accent()"
              letter-spacing="-0.05em"
            >
              FL
            </text>
            <text
              x="29"
              y="24"
              text-anchor="end"
              font-family="DM Mono, ui-monospace, monospace"
              font-size="9"
              [attr.fill]="accent()"
              opacity="0.5"
            >
              ]
            </text>
          </g>
        }
        @case ('ferrlens') {
          <g>
            <g [attr.fill]="accent()" opacity="0.25">
              <rect x="2" y="3" width="3" height="3" />
              <rect x="6" y="3" width="3" height="3" />
              <rect x="10" y="3" width="3" height="3" />
              <rect x="14" y="3" width="3" height="3" />
              <rect x="2" y="7" width="3" height="3" />
              <rect x="14" y="7" width="3" height="3" />
              <rect x="2" y="11" width="3" height="3" />
              <rect x="14" y="11" width="3" height="3" />
              <rect x="2" y="15" width="3" height="3" />
              <rect x="6" y="15" width="3" height="3" />
              <rect x="10" y="15" width="3" height="3" />
              <rect x="14" y="15" width="3" height="3" />
            </g>
            <circle cx="19" cy="19" r="8" [attr.stroke]="accent()" stroke-width="2" fill="none" />
            <line
              x1="25"
              y1="25"
              x2="30"
              y2="30"
              [attr.stroke]="accent()"
              stroke-width="2"
              stroke-linecap="square"
            />
          </g>
        }
        @case ('ferragents') {
          <g>
            <circle cx="16" cy="16" r="3.5" [attr.fill]="accent()" />
            <circle
              cx="16"
              cy="16"
              r="10"
              [attr.stroke]="accent()"
              stroke-width="1.2"
              fill="none"
              opacity="0.35"
            />
            <circle
              cx="16"
              cy="16"
              r="14"
              [attr.stroke]="accent()"
              stroke-width="0.9"
              fill="none"
              opacity="0.2"
            />
            <circle cx="26" cy="16" r="2.5" [attr.fill]="accent()" />
            <circle cx="9" cy="9" r="2" [attr.fill]="accent()" opacity="0.7" />
          </g>
        }
        @case ('ferrfleet') {
          <g>
            <circle cx="16" cy="16" r="3.5" [attr.fill]="accent()" />
            <circle
              cx="16"
              cy="16"
              r="10"
              [attr.stroke]="accent()"
              stroke-width="1.2"
              fill="none"
              opacity="0.35"
            />
            <circle
              cx="16"
              cy="16"
              r="14"
              [attr.stroke]="accent()"
              stroke-width="0.9"
              fill="none"
              opacity="0.2"
            />
            <circle cx="26" cy="16" r="2.5" [attr.fill]="accent()" />
            <circle cx="9" cy="9" r="2" [attr.fill]="accent()" opacity="0.7" />
          </g>
        }
        @default {
          <g>
            <rect
              x="6"
              y="6"
              width="20"
              height="20"
              rx="5"
              [attr.stroke]="accent()"
              stroke-width="1.6"
              fill="none"
              opacity="0.45"
            />
            <circle cx="16" cy="16" r="3.5" [attr.fill]="accent()" />
          </g>
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
      line-height: 0;
    }
    svg {
      display: block;
    }
  `,
})
export class LogoMarkComponent {
  readonly size = input(24);
  readonly accent = input('currentColor');
  readonly product = input.required<ProductSlug>();
}

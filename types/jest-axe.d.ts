declare module "jest-axe" {
  export type AxeNodeResult = Record<string, unknown>;

  export interface AxeViolation extends Record<string, unknown> {
    id: string;
    impact?: string;
    description: string;
    help: string;
    helpUrl: string;
    nodes: AxeNodeResult[];
  }

  export interface AxeResults {
    violations: AxeViolation[];
    passes: AxeNodeResult[];
    incomplete: AxeNodeResult[];
    inapplicable: AxeNodeResult[];
  }

  export type AxeRunOptions = Record<string, unknown>;

  export interface AxeMatcherResult {
    actual: AxeResults;
    message(): string;
    pass: boolean;
  }

  export interface AxeMatchers {
    toHaveNoViolations(results: AxeResults): AxeMatcherResult;
  }

  export function axe(
    html: Element | Document | string,
    config?: AxeRunOptions,
  ): Promise<AxeResults>;

  export function configureAxe(config?: AxeRunOptions): typeof axe;

  export const toHaveNoViolations: AxeMatchers;
}

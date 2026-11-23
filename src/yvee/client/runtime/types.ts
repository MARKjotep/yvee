import type { IStateful } from "@/core/core.core";
import type { HeadConfig } from "../../rendering/head";
import type { PageLoad } from "../load-page";
import type { Layout } from "../mount";
import type { YveeURL } from "../../routing/path";

export interface RuntimeOptions {
  id: string;
  base: string;
  useHistory: boolean;
  url: IStateful<YveeURL>;
  root: IStateful<unknown[]>;
  /**
   * Application instance handed to guard contexts. `Yvee` fills this in; it is
   * optional so harnesses can construct a client without an app.
   * @internal
   */
  app?: unknown;
  load(url: YveeURL, signal: AbortSignal, error?: number): Promise<PageLoad>;
  getHead(): HeadConfig;
  getLayout(): Layout | undefined;
  onLoading(loading: boolean): void;
  onError?(error: unknown, url: YveeURL): void;
  onMount?(): void;
  onUnmount(): void;
}

export interface RuntimeMountOptions {
  id?: string;
  className?: string | string[];
  hydrate?: boolean;
  nonce?: string;
}

export interface ScrollPosition { x: number; y: number; }

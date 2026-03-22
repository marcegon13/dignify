import { RawSourceData } from './raw-source-data.interface';

export interface ISourceConnector {
  /**
   * The provider name (e.g. YOUTUBE)
   */
  readonly providerName: RawSourceData['provider'];

  /**
   * Used by the search engine to query content from the provider.
   */
  search(query: string, maxResults?: number): Promise<RawSourceData[]>;

  /**
   * Used to resolve exact metadata given a provider ID.
   */
  getById(id: string): Promise<RawSourceData | null>;
}

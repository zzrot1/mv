import {
  useQueryClient,
  type QueryClient,
  type QueryKey,
  type UseQueryResult,
} from "@tanstack/react-query";

import { DataHandler } from "./data-handler";
import type { RecordWithId, RecordsOf } from "./utils";

type PageQuery<TData> = UseQueryResult<TData, unknown> & { queryKey: QueryKey };

export abstract class DataPage<TData> {
  readonly records: RecordsOf<TData>;
  readonly total: number;
  readonly totalPages: number;
  readonly page: number;
  readonly limit: number;

  constructor(
    protected readonly query: PageQuery<TData>,
    protected readonly queryClient: QueryClient,
  ) {
    const pageInfo = DataHandler.readPageInfo(query.data);
    this.records = DataHandler.readRecords(
      query.data,
    ) as unknown as RecordsOf<TData>;
    this.total = pageInfo.total;
    this.totalPages = pageInfo.totalPages;
    this.page = pageInfo.page;
    this.limit = pageInfo.limit;
  }

  get isLoading() {
    return this.query.isLoading;
  }

  get isFetching() {
    return this.query.isFetching;
  }

  get isError() {
    return this.query.isError;
  }

  get queryKey() {
    return this.query.queryKey;
  }

  reload() {
    void this.query.refetch();
  }

  updateItem(record: RecordWithId & Partial<RecordsOf<TData>[number]>) {
    return DataHandler.writeRecordToCache(
      this.queryClient,
      this.getResourceName(),
      record,
    );
  }

  removeItem(recordId: RecordWithId["id"]) {
    return DataHandler.removeRecordFromCache(
      this.queryClient,
      this.getResourceName(),
      recordId,
    );
  }

  clampPage(page: number) {
    return Math.min(Math.max(page, 1), this.totalPages);
  }

  protected getResourceName() {
    return String(this.query.queryKey[0]);
  }
}

export function useDataPage<TData, TPage extends DataPage<TData>>(
  PageClass: new (query: PageQuery<TData>, queryClient: QueryClient) => TPage,
  query: PageQuery<TData>,
): TPage {
  const queryClient = useQueryClient();

  return new PageClass(query, queryClient);
}

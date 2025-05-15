import { SupabaseClient } from '@supabase/supabase-js';

interface QueryOptions {
  page?: number;
  pageSize?: number;
  filters?: Record<string, any>;
  sort?: {
    column: string;
    order: 'asc' | 'desc';
  };
  relations?: string[];
  select?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class QueryOptimizer {
  private static instance: QueryOptimizer;
  private defaultPageSize = 20;

  private constructor() {}

  static getInstance(): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer();
    }
    return QueryOptimizer.instance;
  }

  async optimizedQuery<T>(
    supabase: SupabaseClient,
    table: string,
    options: QueryOptions = {}
  ): Promise<PaginatedResponse<T>> {
    const {
      page = 1,
      pageSize = this.defaultPageSize,
      filters = {},
      sort,
      relations = [],
      select = '*'
    } = options;

    // Start building the query
    let query = supabase.from(table).select(
      select + (relations.length > 0 ? `, ${relations.join(', ')}` : ''),
      { count: 'exact' }
    );

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (typeof value === 'object') {
          // Handle range filters
          if (value.gt) query = query.gt(key, value.gt);
          if (value.gte) query = query.gte(key, value.gte);
          if (value.lt) query = query.lt(key, value.lt);
          if (value.lte) query = query.lte(key, value.lte);
          if (value.like) query = query.like(key, value.like);
          if (value.ilike) query = query.ilike(key, value.ilike);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    // Apply sorting
    if (sort) {
      query = query.order(sort.column, { ascending: sort.order === 'asc' });
    }

    // Apply pagination
    const start = (page - 1) * pageSize;
    query = query.range(start, start + pageSize - 1);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return {
      data: data as T[],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  }

  // Helper method for bulk operations with optimized chunking
  async bulkOperation<T>(
    items: T[],
    operation: (chunk: T[]) => Promise<any>,
    chunkSize = 100
  ): Promise<void> {
    const chunks = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      chunks.push(items.slice(i, i + chunkSize));
    }

    await Promise.all(chunks.map(chunk => operation(chunk)));
  }
}

export const queryOptimizer = QueryOptimizer.getInstance(); 
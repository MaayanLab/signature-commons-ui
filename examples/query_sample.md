```
{
  fetch_meta: true
  count: true,
  per_parent_count: true,
  value_count: true
  query: {
    search: [...],
    filters: {
      [filter_field]: [...]
    },
    skip,
    limit
  },
  parent_ids: [...]
  value_count_params: {
    fields: [...],
    skip,
    limit
  }
}
```

```
url params
{
  search: [...],
  libraries: {
    filters: {
      [filter_field]: [...]
    },
    skip,
    limit,
    order,
    value_count_params: {
        fields: [...]
    }
  },
  signatures: {
    filters: {
      [filter_field]: [...]
    },
    skip,
    limit
  }  
}
```

```
saga params
{
  search: [...],
  libraries: {
    filters: {
      [filter_field]: [...]
    },
    skip,
    limit,
    operations: {
      metadata_search: false,
      per_parent_count: false,
      value_count: false,
      count: true
    }
  },
  signatures: {
    filters: {
      [filter_field]: [...]
    },
    skip,
    limit,
    order,
    operations: {
      metadata_search: true,
      per_parent_count: true,
      value_count: true,
      count: true
    }  
  }
}
```
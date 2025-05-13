export function removeOptionalFieldsOfQueryParams(queryParams: any, optionalFields: string[]){
  optionalFields.forEach(field => {
    if (!queryParams[field] || Number.isNaN(queryParams[field])) {
      delete queryParams[field];
    }
  })
}
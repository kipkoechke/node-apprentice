import { Repository, SelectQueryBuilder } from 'typeorm';
import { EntityTarget } from 'typeorm/common/EntityTarget';

export class ApiFeatures<T> {
  public query: SelectQueryBuilder<T>;
  private queryString: any;
  private repository: Repository<T>;

  constructor(repository: Repository<T>, queryString: any) {
    this.repository = repository;
    this.query = repository.createQueryBuilder('entity');
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Filtering
    Object.keys(queryObj).forEach((key) => {
      if (typeof queryObj[key] === 'object') {
        // Handle advanced filtering (gte, gt, lte, lt)
        Object.keys(queryObj[key]).forEach((operator) => {
          const value = queryObj[key][operator];

          switch (operator) {
            case 'gte':
              this.query.andWhere(`entity.${key} >= :${key}_gte`, {
                [`${key}_gte`]: value,
              });
              break;
            case 'gt':
              this.query.andWhere(`entity.${key} > :${key}_gt`, {
                [`${key}_gt`]: value,
              });
              break;
            case 'lte':
              this.query.andWhere(`entity.${key} <= :${key}_lte`, {
                [`${key}_lte`]: value,
              });
              break;
            case 'lt':
              this.query.andWhere(`entity.${key} < :${key}_lt`, {
                [`${key}_lt`]: value,
              });
              break;
          }
        });
      } else {
        // Simple filtering
        this.query.andWhere(`entity.${key} = :${key}`, {
          [key]: queryObj[key],
        });
      }
    });

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').map((field) => {
        // Handle descending sort (prefix with -)
        if (field.startsWith('-')) {
          return [`entity.${field.substring(1)}`, 'DESC'];
        }
        return [`entity.${field}`, 'ASC'];
      });

      sortBy.forEach(([field, order]) => {
        this.query.addOrderBy(field, order);
      });
    } else {
      // Default sort by createdAt
      this.query.orderBy('entity.createdAt', 'DESC');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields
        .split(',')
        .map((field) => `entity.${field}`);
      this.query.select(fields);
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query.skip(skip).take(limit);

    return this;
  }
}

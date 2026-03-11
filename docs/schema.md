# Database Schema

The system uses a relational PostgreSQL database.

Core tables:

1. users
2. brands
3. fragrances
4. tags
5. fragrance_tags
6. collection_items

---

## users

Stores app users who can authenticate and own fragrance collections.

### Columns

- id: integer, primary key
- email: varchar(255), not null, unique
- username: varchar(50), not null, unique
- password_hash: varchar(255), not null
- is_active: boolean, not null, default true
- created_at: timestamptz, not null, default now()
- updated_at: timestamptz, not null, default now()

### Constraints

- unique(email)
- unique(username)

### Notes

- email should be normalized to lowercase in the application layer
- passwords are never stored in plaintext

---

## brands

Stores fragrance designer brands.

### Columns

- id: integer, primary key
- name: varchar(100), not null, unique
- created_at: timestamptz, not null, default now()

### Constraints

- unique(name)

---

## fragrances

Stores the fragrance catalog.

### Columns

- id: integer, primary key
- brand_id: integer, not null, foreign key -> brands.id
- name: varchar(150), not null
- release_year: integer, null
- gender_category: varchar(20), null
- description: text, null
- created_at: timestamptz, not null, default now()
- updated_at: timestamptz, not null, default now()

### Constraints

- unique(brand_id, name)
- release_year must be null or between 1000 and 2100
- gender_category must be null or one of: masculine, feminine, unisex

### Indexes

- index on brand_id
- index on name
- composite index on (brand_id, name)

---

## tags

Stores normalized tags used for classification.

### Allowed Types

- season
- occasion
- time_of_day
- weather
- location_type
- accord
- note

### Columns

- id: integer, primary key
- type: varchar(50), not null
- name: varchar(50), not null
- created_at: timestamptz, not null, default now()

### Constraints

- unique(type, name)
- type must be one of the allowed values

---

## fragrance_tags

Join table between fragrances and tags.

### Columns

- fragrance_id: integer, not null, foreign key -> fragrances.id
- tag_id: integer, not null, foreign key -> tags.id

### Constraints

- primary key (fragrance_id, tag_id)

### Delete Behavior

- on delete cascade from fragrances
- on delete cascade from tags

### Indexes

- primary key index on (fragrance_id, tag_id)
- index on tag_id

---

## collection_items

Stores user-owned fragrances and collection metadata.

### Columns

- id: integer, primary key
- user_id: integer, not null, foreign key -> users.id
- fragrance_id: integer, not null, foreign key -> fragrances.id
- ownership_type: varchar(20), not null
- ml_remaining: numeric(6,2), null
- personal_rating: integer, null
- last_worn_at: timestamptz, null
- times_worn: integer, not null, default 0
- created_at: timestamptz, not null, default now()
- updated_at: timestamptz, not null, default now()

### Constraints

- unique(user_id, fragrance_id)
- ownership_type must be one of: full_bottle, decant, sample
- ml_remaining must be null or >= 0
- personal_rating must be null or between 1 and 10
- times_worn must be >= 0

### Delete Behavior

- on delete cascade from users
- on delete restrict from fragrances

### Indexes

- unique index on (user_id, fragrance_id)
- index on user_id
- index on fragrance_id

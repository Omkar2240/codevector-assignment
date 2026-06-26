# codevector-assignment

### What I chose and why

* **Backend:** Node.js + Express.js
* **Database:** PostgreSQL (hosted on Neon)
* **Database access:** Raw SQL using `pg`

I chose PostgreSQL because the data is highly structured and the application requires efficient filtering, sorting, and pagination. PostgreSQL provides strong consistency guarantees and excellent indexing support.

For pagination, I implemented **cursor (keyset) pagination** instead of offset pagination. Offset pagination becomes slower as offsets grow and can produce duplicate or missing records when new products are inserted while users are browsing.

To satisfy the requirement that users should not see duplicate or missing products while data changes, I implemented **snapshot-based cursor pagination**. A snapshot timestamp is generated during the first request and reused for subsequent requests, ensuring a consistent view of the dataset throughout the browsing session.

I also created composite indexes on `(category, created_at DESC, id DESC)` to optimize filtering and pagination queries.

### What I would improve with more time

* Add searching functionality
* Add API documentation using Swagger.
* Add Redis caching for frequently accessed queries.
* Add observability feature such as structured logging.
* Containerize the application using Docker.

### How I used AI

I used AI primarily as a learning and implementation assistant. AI helped me:

* Explore different pagination approaches and their tradeoffs.
* Discuss database choices and indexing strategies.
* Review and refine implementation ideas.
* Speed up boilerplate code generation.

I verified and modified all generated code before using it. During development, I found that AI occasionally suggested offset pagination for a changing dataset, which would not satisfy the consistency requirement. After further investigation, I chose snapshot-based cursor pagination because it better guarantees correctness while data changes.

I also reviewed and tested all AI-generated code manually to ensure I fully understood the implementation.

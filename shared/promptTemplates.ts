// solofounder-canvas: Architecture diagram prompt templates
// Use these as starting points for common architecture diagram requests

export const ARCHITECTURE_TEMPLATES = {
  // ── Infrastructure ──────────────────────────────────────────────────────────
  microservices:
    'Нарисуй архитектуру микросервисов для [описание]. Включи: API Gateway, Load Balancer, сервисы, базы данных, кеш, очереди. Добавь стоимость и latency.',
  k8sCluster:
    'Нарисуй топологию Kubernetes кластера для [описание]. Покажи: nodes, pods, services, ingress, persistent volumes. Добавь resource limits.',
  highAvailability:
    'Спроектируй high-availability архитектуру для [описание]. Покажи: multi-AZ deployment, failover paths, health checks, SLA targets.',
  serverless:
    'Спроектируй serverless архитектуру для [описание] на базе AWS Lambda или Cloudflare Workers. Включи: API Gateway, функции, triggers (HTTP/SQS/S3/cron), cold start latency, DynamoDB/KV store, IAM roles. Покажи cost per million invocations.',
  multiCloud:
    'Нарисуй multi-cloud стратегию для [описание]. Включи: AWS и GCP/Azure зоны, ingress routing (Cloudflare/GlobalAccelerator), репликацию данных между cloud, failover политику, cloud-agnostic control plane. Покажи latency между регионами.',
  edgeComputing:
    'Спроектируй edge/CDN архитектуру для [описание]. Включи: PoP-узлы (Cloudflare/Fastly), origin shield, edge functions, cache hierarchy (L1/L2), purge strategy, geo-routing. Покажи cache hit ratio и TTFB по регионам.',
  serviceMesh:
    'Нарисуй service mesh архитектуру для [описание] на базе Istio или Linkerd. Включи: sidecar proxies, control plane (istiod/linkerd-control-plane), mTLS boundaries, traffic policies, circuit breakers, distributed tracing. Покажи overhead на latency.',

  // ── Data ────────────────────────────────────────────────────────────────────
  dataPipeline:
    'Спроектируй data pipeline для [описание]. Включи: источники данных, ingestion, processing, storage, serving layer. Покажи throughput на каждом этапе.',
  mlPipeline:
    'Спроектируй ML pipeline для [описание]. Включи: data collection, feature store, training, model registry, serving, monitoring.',
  streamProcessing:
    'Нарисуй real-time stream processing архитектуру для [описание] на базе Kafka + Flink/Spark Streaming. Включи: producers, Kafka topics/partitions, consumer groups, stateful operators, windowing, sink connectors. Покажи throughput (events/s) и lag.',
  databaseSharding:
    'Спроектируй горизонтальное шардирование баз данных для [описание]. Включи: shard key выбор, router/proxy слой, consistent hashing, rebalancing strategy, cross-shard queries, global secondary index. Покажи distribution и hotspot mitigation.',
  dataLakehouse:
    'Спроектируй современный data lakehouse для [описание] на базе Apache Iceberg или Delta Lake. Включи: object storage (S3/GCS), catalog (Glue/Hive), query engine (Trino/Spark), ingestion (Debezium/Fivetran), BI layer. Покажи стоимость хранения и query performance.',
  vectorSearch:
    'Нарисуй vector search и RAG pipeline для [описание]. Включи: embedding model, chunking strategy, vector DB (Qdrant/Pinecone/Weaviate), ANN index, retrieval pipeline, reranker, LLM serving. Покажи recall@10 и latency.',

  // ── DevOps ───────────────────────────────────────────────────────────────────
  cicd:
    'Спроектируй CI/CD pipeline для [описание]. Этапы: commit → build → test → staging → production. Покажи time-to-deploy.',
  monitoring:
    'Нарисуй observability stack для [описание]. Включи: metrics (Prometheus), logs (Loki), traces (Jaeger), alerting, dashboards.',
  costBreakdown:
    'Визуализируй cost breakdown инфраструктуры для [описание]. Покажи стоимость каждого компонента, total monthly cost, optimization hints.',
  blueGreenDeploy:
    'Спроектируй blue-green deployment pipeline для [описание]. Включи: два идентичных окружения, load balancer switch, smoke tests, rollback trigger, database migration strategy, feature flag sync. Покажи downtime = 0 flow.',
  canaryRelease:
    'Нарисуй canary release систему для [описание]. Включи: traffic splitting (1% → 10% → 50% → 100%), metrics evaluation gates, автоматический rollback по error rate, progressive delivery controller (Flagger/Argo Rollouts). Покажи rollout timeline.',
  featureFlags:
    'Спроектируй feature flag систему для [описание]. Включи: flag store, evaluation SDK (client/server), targeting rules (user/segment/geo), A/B testing layer, audit log, kill switch. Покажи latency evaluation и flag propagation time.',

  // ── Patterns ─────────────────────────────────────────────────────────────────
  eventDriven:
    'Нарисуй event-driven архитектуру для [описание]. Включи: producers, message broker, consumers, dead letter queue. Покажи event flow.',
  authFlow:
    'Нарисуй auth flow для [описание]. Включи: OAuth2/OIDC provider, token service, API gateway, session store. Покажи security boundaries.',
  zeroCrust:
    'Спроектируй zero-trust security архитектуру для [описание]. Включи: identity provider, device trust (mTLS/certificate), policy engine (OPA), micro-segmentation, east-west inspection, SIEM. Покажи все auth boundaries и blast radius.',
  graphqlFederation:
    'Нарисуй federated GraphQL архитектуру для [описание]. Включи: gateway (Apollo Router/GraphQL Mesh), subgraphs по доменам, schema registry, entity resolution, persisted queries, response caching. Покажи query planning и latency breakdown.',
  apiGateway:
    'Спроектируй API gateway слой для [описание]. Включи: rate limiting (token bucket/leaky bucket), auth middleware, request routing, circuit breaker, response transformation, API versioning, developer portal. Покажи throughput и p99 latency.',
  bffPattern:
    'Нарисуй Backend-for-Frontend (BFF) архитектуру для [описание]. Включи: отдельные BFF для web/mobile/3rd-party, aggregation logic, downstream сервисы, cache слой, GraphQL/REST decision. Покажи payload reduction vs monolith gateway.',
  sagaPattern:
    'Спроектируй распределённые транзакции по паттерну Saga для [описание]. Включи: orchestrator или choreography вариант, compensating transactions, state machine, idempotency keys, timeout и retry logic. Покажи happy path и failure rollback flow.',
  cqrsEventSourcing:
    'Нарисуй CQRS + Event Sourcing архитектуру для [описание]. Включи: command handlers, event store (EventStoreDB/Kafka), projections, read models (denormalized views), snapshot strategy, eventual consistency lag. Покажи write vs read path.',

  // ── Domains ───────────────────────────────────────────────────────────────────
  multiTenancy:
    'Спроектируй multi-tenant SaaS архитектуру для [описание]. Включи: tenant isolation модель (pool/silo/bridge), data partitioning, tenant-aware routing, quota enforcement, onboarding flow, billing integration. Покажи resource sharing и isolation tradeoffs.',
  paymentSystem:
    'Нарисуй payment processing архитектуру для [описание]. Включи: payment gateway (Stripe/Adyen), idempotency layer, ledger service, reconciliation job, fraud detection, PCI DSS scope boundary, webhook retry. Покажи money flow и failure handling.',
  notificationSystem:
    'Спроектируй multi-channel notification сервис для [описание]. Включи: event ingestion, routing engine, channel adapters (push/email/SMS/webhook), delivery tracking, deduplication, rate limiting per user, preferences store. Покажи delivery latency и retry strategy.',
  searchEngine:
    'Нарисуй search архитектуру для [описание]. Включи: indexing pipeline (crawl → parse → enrich → index), inverted index (Elasticsearch/Typesense), ranking model, query parser, spell correction, facets, А/Б тест ranking. Покажи indexing lag и query latency.',
  contentDelivery:
    'Спроектируй CDN + media processing pipeline для [описание]. Включи: upload service, transcoding workers (FFmpeg/MediaConvert), storage (S3 + Glacier), CDN edge (CloudFront/Cloudflare), adaptive bitrate (HLS/DASH), DRM. Покажи стоимость хранения и streaming cost.',
  realtimeCollaboration:
    'Нарисуй архитектуру real-time collaborative editing для [описание]. Включи: CRDT или OT движок, sync server (WebSocket/WebRTC), presence service, conflict resolution, offline queue, persistence layer. Покажи convergence guarantee и latency.',
  iotPlatform:
    'Спроектируй IoT платформу для [описание]. Включи: device registry, MQTT broker (EMQX/HiveMQ), ingestion gateway, shadow state, rule engine, OTA updates, time-series DB (InfluxDB/TimescaleDB), device security (mTLS + certificate rotation). Покажи масштаб (devices/s).',
  gameBackend:
    'Нарисуй backend архитектуру для multiplayer игры [описание]. Включи: matchmaking service, game server fleet (агентура/Agones), state sync (WebSocket/UDP), leaderboard (Redis sorted sets), anti-cheat, telemetry pipeline, лобби и chat. Покажи CCU capacity и tick rate.',
} as const

export type ArchitectureTemplateKey = keyof typeof ARCHITECTURE_TEMPLATES

export const TEMPLATE_CATEGORIES: Record<string, ArchitectureTemplateKey[]> = {
  Infrastructure: [
    'microservices',
    'k8sCluster',
    'highAvailability',
    'serverless',
    'multiCloud',
    'edgeComputing',
    'serviceMesh',
  ],
  Data: [
    'dataPipeline',
    'mlPipeline',
    'streamProcessing',
    'databaseSharding',
    'dataLakehouse',
    'vectorSearch',
  ],
  DevOps: [
    'cicd',
    'monitoring',
    'costBreakdown',
    'blueGreenDeploy',
    'canaryRelease',
    'featureFlags',
  ],
  Patterns: [
    'eventDriven',
    'authFlow',
    'zeroCrust',
    'graphqlFederation',
    'apiGateway',
    'bffPattern',
    'sagaPattern',
    'cqrsEventSourcing',
  ],
  Domains: [
    'multiTenancy',
    'paymentSystem',
    'notificationSystem',
    'searchEngine',
    'contentDelivery',
    'realtimeCollaboration',
    'iotPlatform',
    'gameBackend',
  ],
}

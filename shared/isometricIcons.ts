/** Catalog of available isometric icons organized by category. */
export const ISO_ICON_CATALOG = {
	compute: ['server', 'vm', 'container', 'lambda', 'worker', 'ec2', 'gce'],
	network: ['load-balancer', 'cdn', 'dns', 'api-gateway', 'firewall', 'vpc', 'router'],
	storage: [
		'database',
		'object-storage',
		's3',
		'rds',
		'dynamodb',
		'redis-store',
		'filesystem',
	],
	cache: ['redis', 'memcached', 'cdn-cache', 'edge-cache'],
	ai: ['model-server', 'feature-store', 'training-cluster', 'embedding-service', 'vector-db'],
	monitoring: ['prometheus', 'grafana', 'alertmanager', 'log-aggregator', 'tracer'],
} as const

export type IsoIconCategory = keyof typeof ISO_ICON_CATALOG
export type IsoIconId = (typeof ISO_ICON_CATALOG)[IsoIconCategory][number]

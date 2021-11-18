const STATUS = {
	available: 'available',
	unavailable: 'unavailable'
} as const;
type STATUS = typeof STATUS[keyof typeof STATUS];

export type {STATUS};
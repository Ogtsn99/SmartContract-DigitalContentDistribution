const ROLE = {
	node: 'Node',
	client: 'Client'
} as const;
export type ROLE = typeof ROLE[keyof typeof ROLE];